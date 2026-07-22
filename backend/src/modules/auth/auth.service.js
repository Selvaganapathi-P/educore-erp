const jwt    = require('jsonwebtoken');
const crypto = require('crypto');
const { env }      = require('../../config/env');
const { User }     = require('../users/user.model');
const { AuditLog } = require('./auditLog.model');
const { AppError, UnauthorizedError, NotFoundError } = require('../../utils/appError');
const { logger } = require('../../utils/logger');

const MAX_ATTEMPTS  = 5;
const LOCK_DURATION = 30 * 60 * 1000; // 30 min

const signAccess = (user, permissions = []) =>
  jwt.sign(
    {
      sub:         user._id.toString(),
      email:       user.email,
      role:        user.role,
      schoolId:    user.schoolId?.toString() ?? null,
      permissions,
    },
    env.JWT_SECRET,
    { expiresIn: env.JWT_EXPIRES_IN }
  );

const signRefresh = (userId) =>
  jwt.sign({ sub: userId }, env.JWT_REFRESH_SECRET, { expiresIn: env.JWT_REFRESH_EXPIRES_IN });

const writeAudit = async (userId, schoolId, action, module, description, ip, userAgent, status = 'success') => {
  try {
    await AuditLog.create({ userId, schoolId, action, module, description, ip, userAgent, status });
  } catch (e) {
    logger.error('Audit log write failed', e);
  }
};

const login = async (email, password, ip = '', userAgent = '', permissions = []) => {
  const user = await User.findOne({ email: email.toLowerCase(), isDeleted: false })
    .select('+password +refreshTokens +loginAttempts +lockUntil');

  if (!user) throw new UnauthorizedError('Invalid email or password');
  if (user.isLocked()) throw new UnauthorizedError('Account locked. Try again in 30 minutes.');
  if (user.status === 'suspended') throw new UnauthorizedError('Account suspended');

  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    user.loginAttempts += 1;
    if (user.loginAttempts >= MAX_ATTEMPTS) {
      user.lockUntil     = new Date(Date.now() + LOCK_DURATION);
      user.loginAttempts = 0;
    }
    await user.save();
    await writeAudit(user._id, user.schoolId, 'LOGIN_FAILED', 'auth', `Failed login for ${email}`, ip, userAgent, 'failure');
    throw new UnauthorizedError('Invalid email or password');
  }

  user.loginAttempts = 0;
  user.lockUntil     = undefined;
  user.lastLogin     = new Date();

  const accessToken  = signAccess(user, permissions);
  const refreshToken = signRefresh(user._id.toString());

  user.refreshTokens = [...(user.refreshTokens || []).slice(-4), refreshToken];
  await user.save();

  await writeAudit(user._id, user.schoolId, 'LOGIN', 'auth', 'User logged in', ip, userAgent);

  return {
    accessToken,
    refreshToken,
    user: {
      _id:         user._id.toString(),
      email:       user.email,
      role:        user.role,
      schoolId:    user.schoolId?.toString() ?? null,
      profile:     user.profile,
      preferences: user.preferences,
    },
  };
};

const refreshTokens = async (token) => {
  let payload;
  try {
    payload = jwt.verify(token, env.JWT_REFRESH_SECRET);
  } catch {
    throw new UnauthorizedError('Invalid or expired refresh token');
  }

  const user = await User.findById(payload.sub).select('+refreshTokens');
  if (!user || user.isDeleted) throw new UnauthorizedError('User not found');
  if (!user.refreshTokens.includes(token)) throw new UnauthorizedError('Refresh token revoked');

  const newAccess  = signAccess(user, []);
  const newRefresh = signRefresh(user._id.toString());

  user.refreshTokens = user.refreshTokens.filter((t) => t !== token).concat(newRefresh).slice(-5);
  await user.save();

  return { accessToken: newAccess, refreshToken: newRefresh };
};

const logout = async (userId, refreshToken) => {
  const user = await User.findById(userId).select('+refreshTokens');
  if (!user) return;
  user.refreshTokens = user.refreshTokens.filter((t) => t !== refreshToken);
  await user.save();
};

const forgotPassword = async (email) => {
  const user = await User.findOne({ email: email.toLowerCase(), isDeleted: false });
  if (!user) return 'ok'; // never reveal existence

  const token  = crypto.randomBytes(32).toString('hex');
  const hashed = crypto.createHash('sha256').update(token).digest('hex');

  user.passwordResetToken  = hashed;
  user.passwordResetExpiry = new Date(Date.now() + 15 * 60 * 1000);
  await user.save();

  logger.info(`[DEV] Password reset token for ${email}: ${token}`);
  return token;
};

const resetPassword = async (token, newPassword) => {
  const hashed = crypto.createHash('sha256').update(token).digest('hex');
  const user = await User.findOne({
    passwordResetToken:  hashed,
    passwordResetExpiry: { $gt: new Date() },
    isDeleted: false,
  }).select('+password +refreshTokens +passwordResetToken +passwordResetExpiry');

  if (!user) throw new AppError('Reset token is invalid or has expired', 400);

  user.password            = newPassword;
  user.passwordResetToken  = undefined;
  user.passwordResetExpiry = undefined;
  user.refreshTokens       = [];
  await user.save();
};

const changePassword = async (userId, currentPassword, newPassword) => {
  const user = await User.findById(userId).select('+password');
  if (!user) throw new NotFoundError('User');

  const isMatch = await user.comparePassword(currentPassword);
  if (!isMatch) throw new UnauthorizedError('Current password is incorrect');

  user.password = newPassword;
  await user.save();
};

module.exports = { login, refreshTokens, logout, forgotPassword, resetPassword, changePassword };
