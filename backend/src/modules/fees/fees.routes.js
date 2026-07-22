const express = require('express');
const router  = express.Router();
const ctrl    = require('./fees.controller');
const { authenticate, authorize } = require('../../middleware/auth.middleware');
const { requireTenant } = require('../../middleware/tenant.middleware');
const { validate } = require('../../middleware/validate.middleware');
const { createStructureSchema, generateInvoicesSchema, recordPaymentSchema, applyConcessionSchema } = require('./fees.schema');

const ADMIN   = ['super_admin','school_admin','principal'];
const FINANCE = [...ADMIN, 'accountant'];
const VIEW    = [...FINANCE, 'student','parent','teacher'];

router.use(authenticate, requireTenant);

// Dashboard & reports
router.get('/dashboard',   authorize(...FINANCE), ctrl.dashboard);
router.get('/outstanding', authorize(...FINANCE), ctrl.outstanding);

// Fee structures
router.post  ('/structures',     authorize(...ADMIN),   validate(createStructureSchema), ctrl.createStructure);
router.get   ('/structures',     authorize(...FINANCE), ctrl.listStructures);
router.get   ('/structures/:id', authorize(...FINANCE), ctrl.getStructure);
router.put   ('/structures/:id', authorize(...ADMIN),   ctrl.updateStructure);
router.delete('/structures/:id', authorize(...ADMIN),   ctrl.deleteStructure);

// Invoice generation
router.post('/invoices/generate', authorize(...FINANCE), validate(generateInvoicesSchema), ctrl.generateInvoices);

// Invoice management
router.get   ('/invoices',              authorize(...VIEW),    ctrl.listInvoices);
router.get   ('/invoices/:id',          authorize(...VIEW),    ctrl.getInvoice);
router.patch ('/invoices/:id/concession',authorize(...FINANCE),validate(applyConcessionSchema), ctrl.applyConcession);
router.patch ('/invoices/:id/waive',    authorize(...ADMIN),   ctrl.waiveInvoice);

// Payments
router.post  ('/invoices/:id/pay',      authorize(...FINANCE), validate(recordPaymentSchema), ctrl.recordPayment);
router.patch ('/payments/:payId/void',  authorize(...ADMIN),   ctrl.voidPayment);

module.exports = router;
