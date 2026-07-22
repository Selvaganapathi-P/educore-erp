const router = require('express').Router();
const ctrl   = require('./health.controller');
const { authenticate, authorize } = require('../../middleware/auth.middleware');
const { requireTenant } = require('../../middleware/tenant.middleware');

const { validate }      = require('../../middleware/validate.middleware');
const { upsertHealthRecordSchema, createVisitSchema, updateVisitSchema } = require('./health.schema');

const HEALTH_STAFF = ['school_admin','principal','nurse','vice_principal'];
const VIEWERS      = [...HEALTH_STAFF, 'teacher','hr'];

router.use(authenticate, requireTenant);

router.get('/dashboard', authorize(...VIEWERS), ctrl.getDashboard);

router.route('/records')
  .get(authorize(...VIEWERS), ctrl.listRecords)
  .post(authorize(...HEALTH_STAFF), validate(upsertHealthRecordSchema), ctrl.upsertRecord);

router.get('/records/member', authorize(...VIEWERS), ctrl.getRecord);

router.route('/visits')
  .get(authorize(...VIEWERS), ctrl.listVisits)
  .post(authorize(...HEALTH_STAFF), validate(createVisitSchema), ctrl.createVisit);

router.route('/visits/:id')
  .get(authorize(...VIEWERS), ctrl.getVisit)
  .put(authorize(...HEALTH_STAFF), validate(updateVisitSchema), ctrl.updateVisit)
  .delete(authorize(...HEALTH_STAFF), ctrl.deleteVisit);

module.exports = router;
