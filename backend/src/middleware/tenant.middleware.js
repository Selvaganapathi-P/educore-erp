const { School } = require('../modules/schools/school.model');
const { ForbiddenError, NotFoundError } = require('../utils/appError');

/**
 * Enforces school tenancy. Super admins bypass.
 * All other roles must belong to an active, non-expired school.
 */
const requireTenant = async (req, res, next) => {
  try {
    if (!req.user) return next(new ForbiddenError('Authentication required'));
    if (req.user.role === 'super_admin') return next();

    const schoolId = req.user.schoolId;
    if (!schoolId) return next(new ForbiddenError('No school context for this account'));

    const school = await School.findById(schoolId).lean();
    if (!school || school.isDeleted) return next(new NotFoundError('School'));
    if (school.status === 'suspended')
      return next(new ForbiddenError('School account is suspended. Contact support.'));

    if (school.trialExpiry && school.trialExpiry < new Date())
      return next(new ForbiddenError('Trial period expired. Please upgrade your plan.'));

    req.schoolId = schoolId;
    next();
  } catch (err) {
    next(err);
  }
};

/** Silent enrichment — injects schoolId without blocking */
const injectTenant = (req, res, next) => {
  if (req.user?.schoolId) req.schoolId = req.user.schoolId;
  next();
};

module.exports = { requireTenant, injectTenant };
