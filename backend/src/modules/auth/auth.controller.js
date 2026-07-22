const authService = require('./auth.service');
const { sendSuccess } = require('../../utils/apiResponse');
const { UnauthorizedError } = require('../../utils/appError');

const getIp = (req) =>
  (req.headers['x-forwarded-for'] || '').split(',')[0].trim() ||
  req.socket?.remoteAddress ||
  'unknown';

const COOKIE_OPTS = (remember = false) => ({
  httpOnly: true,
  secure:   process.env.NODE_ENV === 'production',
  sameSite: 'strict',
  maxAge:   (remember ? 30 : 7) * 24 * 60 * 60 * 1000,
  path:     '/api/auth/refresh',
});

const login = async (req, res, next) => {
  try {
    const { email, password, rememberMe } = req.body;
    const result = await authService.login(email, password, getIp(req), req.headers['user-agent'] || '');
    res.cookie('refreshToken', result.refreshToken, COOKIE_OPTS(rememberMe));
    const { refreshToken: _rt, ...payload } = result;
    sendSuccess(res, payload, 'Login successful');
  } catch (err) { next(err); }
};

const refresh = async (req, res, next) => {
  try {
    const token = req.cookies?.refreshToken || req.body?.refreshToken;
    if (!token) throw new UnauthorizedError('Refresh token required');
    const tokens = await authService.refreshTokens(token);
    res.cookie('refreshToken', tokens.refreshToken, COOKIE_OPTS());
    sendSuccess(res, { accessToken: tokens.accessToken }, 'Token refreshed');
  } catch (err) { next(err); }
};

const logout = async (req, res, next) => {
  try {
    const token = req.cookies?.refreshToken || req.body?.refreshToken;
    if (req.user && token) await authService.logout(req.user._id, token);
    res.clearCookie('refreshToken', { path: '/api/auth/refresh' });
    sendSuccess(res, null, 'Logged out');
  } catch (err) { next(err); }
};

const forgotPassword = async (req, res, next) => {
  try {
    await authService.forgotPassword(req.body.email);
    sendSuccess(res, null, 'If that email exists, a reset link has been sent.');
  } catch (err) { next(err); }
};

const resetPassword = async (req, res, next) => {
  try {
    await authService.resetPassword(req.body.token, req.body.password);
    sendSuccess(res, null, 'Password reset successfully');
  } catch (err) { next(err); }
};

const changePassword = async (req, res, next) => {
  try {
    await authService.changePassword(req.user._id, req.body.currentPassword, req.body.newPassword);
    sendSuccess(res, null, 'Password changed successfully');
  } catch (err) { next(err); }
};

const me = (req, res) => sendSuccess(res, req.user, 'Profile fetched');

module.exports = { login, refresh, logout, forgotPassword, resetPassword, changePassword, me };
