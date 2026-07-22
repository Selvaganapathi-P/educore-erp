const express = require('express');
const router  = express.Router();
const ctrl    = require('./school.controller');
const { authenticate, authorize } = require('../../middleware/auth.middleware');
const { validate } = require('../../middleware/validate.middleware');
const { createSchoolSchema, updateSchoolSchema, schoolStatusSchema, listSchoolsQuerySchema } = require('./school.schema');
const asyncHandler = fn => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

router.use(authenticate);

// Super-admin only
router.get('/stats', authorize('super_admin'), asyncHandler(ctrl.getSchoolStats));

router.get(
  '/',
  authorize('super_admin'),
  validate(listSchoolsQuerySchema, 'query'),
  asyncHandler(ctrl.listSchools),
);

router.post(
  '/',
  authorize('super_admin'),
  validate(createSchoolSchema),
  asyncHandler(ctrl.createSchool),
);

router.get(
  '/:id',
  authorize('super_admin', 'school_admin', 'principal'),
  asyncHandler(ctrl.getSchool),
);

router.put(
  '/:id',
  authorize('super_admin'),
  validate(updateSchoolSchema),
  asyncHandler(ctrl.updateSchool),
);

router.patch(
  '/:id/status',
  authorize('super_admin'),
  validate(schoolStatusSchema),
  asyncHandler(ctrl.updateSchoolStatus),
);

router.delete(
  '/:id',
  authorize('super_admin'),
  asyncHandler(ctrl.deleteSchool),
);

module.exports = router;
