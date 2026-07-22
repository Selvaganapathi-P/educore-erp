const router = require('express').Router();
const ctrl   = require('./events.controller');
const { authenticate }  = require('../../middleware/auth.middleware');
const { requireTenant } = require('../../middleware/tenant.middleware');
const { authorize }     = require('../../middleware/rbac.middleware');
const { validate }      = require('../../middleware/validate.middleware');
const { createEventSchema, updateEventSchema, issueCertSchema } = require('./events.schema');

const ADMINS   = ['school_admin','principal','vice_principal'];
const VIEWERS  = [...ADMINS, 'teacher','accountant','hr','receptionist','student','parent'];
const CERT_OPS = ['school_admin','principal','vice_principal','receptionist'];

router.use(authenticate, requireTenant);

router.get('/dashboard', authorize(...VIEWERS), ctrl.getDashboard);

router.route('/events')
  .get(authorize(...VIEWERS), ctrl.listEvents)
  .post(authorize(...ADMINS), validate(createEventSchema), ctrl.createEvent);

router.route('/events/:id')
  .get(authorize(...VIEWERS), ctrl.getEvent)
  .put(authorize(...ADMINS), validate(updateEventSchema), ctrl.updateEvent)
  .delete(authorize(...ADMINS), ctrl.deleteEvent);

router.route('/certificates')
  .get(authorize(...CERT_OPS), ctrl.listCertificates)
  .post(authorize(...CERT_OPS), validate(issueCertSchema), ctrl.issueCertificate);

router.route('/certificates/:id')
  .get(authorize(...CERT_OPS), ctrl.getCertificate)
  .put(authorize(...CERT_OPS), ctrl.updateCertificate)
  .delete(authorize(...CERT_OPS), ctrl.deleteCertificate);

module.exports = router;
