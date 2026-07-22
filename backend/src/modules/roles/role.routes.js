const express = require('express');
const router  = express.Router();
const ctrl    = require('./role.controller');
const { authenticate, authorize } = require('../../middleware/auth.middleware');
const { validate } = require('../../middleware/validate.middleware');
const { updateRolePermissionsSchema, assignRoleSchema } = require('./role.schema');

router.use(authenticate);

router.get('/permissions/catalogue',
  authorize('super_admin','school_admin','principal','hr','it_administrator'),
  ctrl.listPermissions,
);

router.get('/stats',
  authorize('super_admin','school_admin','principal','hr'),
  ctrl.getRoleStats,
);

router.get('/',
  authorize('super_admin','school_admin','principal','hr','it_administrator'),
  ctrl.listRoles,
);

router.get('/:name',
  authorize('super_admin','school_admin','principal','hr','it_administrator'),
  ctrl.getRole,
);

router.put('/:name/permissions',
  authorize('super_admin','school_admin','it_administrator'),
  validate(updateRolePermissionsSchema),
  ctrl.updatePermissions,
);

router.post('/assign',
  authorize('super_admin','school_admin','principal','hr'),
  validate(assignRoleSchema),
  ctrl.assignRole,
);

module.exports = router;
