const express = require('express');
const router  = express.Router();
const ctrl    = require('./admission.controller');
const { authenticate, authorize } = require('../../middleware/auth.middleware');
const { requireTenant } = require('../../middleware/tenant.middleware');
const { validate } = require('../../middleware/validate.middleware');
const {
  createAdmissionSchema, updateAdmissionSchema,
  updateStatusSchema, listAdmissionsQuerySchema,
} = require('./admission.schema');

const ADMISSION_ROLES = ['super_admin','school_admin','principal','vice_principal','receptionist'];

router.use(authenticate, requireTenant);

router.get('/stats', authorize(...ADMISSION_ROLES), ctrl.getPipelineStats);

router.get(
  '/',
  authorize(...ADMISSION_ROLES, 'hr'),
  validate(listAdmissionsQuerySchema, 'query'),
  ctrl.list,
);

router.post(
  '/',
  authorize(...ADMISSION_ROLES),
  validate(createAdmissionSchema),
  ctrl.create,
);

router.get('/:id',    authorize(...ADMISSION_ROLES), ctrl.getById);

router.put(
  '/:id',
  authorize(...ADMISSION_ROLES),
  validate(updateAdmissionSchema),
  ctrl.update,
);

router.patch(
  '/:id/status',
  authorize(...ADMISSION_ROLES),
  validate(updateStatusSchema),
  ctrl.updateStatus,
);

router.post(
  '/:id/enroll',
  authorize('super_admin','school_admin','principal'),
  ctrl.enroll,
);

router.delete('/:id', authorize('super_admin','school_admin'), ctrl.remove);

module.exports = router;
