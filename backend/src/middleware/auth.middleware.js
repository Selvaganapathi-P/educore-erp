const jwt = require('jsonwebtoken');
const { env } = require('../config/env');
const { User } = require('../modules/users/user.model');
const { UnauthorizedError, ForbiddenError } = require('../utils/appError');

const authenticate = async (req, res, next) => {
  try {
    const header = req.headers.authorization;
    if (!header?.startsWith('Bearer ')) throw new UnauthorizedError('No token provided');

    const token = header.split(' ')[1];
    let decoded;
    try {
      decoded = jwt.verify(token, env.JWT_SECRET);
    } catch (e) {
      if (e.name === 'TokenExpiredError') throw new UnauthorizedError('Token expired');
      throw new UnauthorizedError('Invalid token');
    }

    const user = await User.findById(decoded.sub).lean();
    if (!user || user.isDeleted) throw new UnauthorizedError('User not found');
    if (user.status === 'suspended') throw new UnauthorizedError('Account suspended');
    if (user.status === 'inactive')  throw new UnauthorizedError('Account inactive');

    req.user = {
      _id:         decoded.sub,
      email:       decoded.email,
      role:        decoded.role,
      schoolId:    decoded.schoolId || null,
      permissions: decoded.permissions || [],
    };
    if (decoded.schoolId) req.schoolId = decoded.schoolId;

    next();
  } catch (err) {
    next(err);
  }
};

const authorize = (...roles) => (req, res, next) => {
  if (!req.user) return next(new UnauthorizedError());
  if (!roles.includes(req.user.role))
    return next(new ForbiddenError(`Role '${req.user.role}' is not permitted`));
  next();
};

const hasPermission = (permission) => (req, res, next) => {
  if (!req.user) return next(new UnauthorizedError());
  const { role, permissions } = req.user;
  if (role === 'super_admin' || permissions.includes('*') || permissions.includes(permission))
    return next();
  next(new ForbiddenError(`Missing permission: ${permission}`));
};

module.exports = { authenticate, authorize, hasPermission };
