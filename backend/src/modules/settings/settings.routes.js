const express = require('express');
const router  = express.Router({ mergeParams: true });
const ctrl    = require('./settings.controller');
const { authenticate, authorize } = require('../../middleware/auth.middleware');
const { requireTenant } = require('../../middleware/tenant.middleware');
const asyncHandler = fn => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

router.use(authenticate);

// /api/schools/:schoolId/settings  — super admin, scoped to any school
// /api/settings                     — school admin / principal / hr — own school
router.get(  '/',           requireTenant, authorize('super_admin','school_admin','principal','hr'), asyncHandler(ctrl.getSettings));
router.put(  '/',           requireTenant, authorize('super_admin','school_admin'),                 asyncHandler(ctrl.updateSettings));
router.patch('/:section',   requireTenant, authorize('super_admin','school_admin'),                 asyncHandler(ctrl.updateSettingsSection));

module.exports = router;
