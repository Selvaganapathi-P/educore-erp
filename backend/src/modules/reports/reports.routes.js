const router = require('express').Router();
const ctrl   = require('./reports.controller');
const { authenticate }  = require('../../middleware/auth.middleware');
const { requireTenant } = require('../../middleware/tenant.middleware');
const { authorize }     = require('../../middleware/rbac.middleware');

const REPORT_ROLES = ['school_admin','principal','vice_principal','accountant','hr'];

router.use(authenticate, requireTenant);

router.get('/summary',    authorize(...REPORT_ROLES), ctrl.getSchoolSummary);
router.get('/attendance', authorize(...REPORT_ROLES, 'teacher'), ctrl.getAttendanceReport);
router.get('/fees',       authorize(...REPORT_ROLES), ctrl.getFeeReport);
router.get('/academic',   authorize(...REPORT_ROLES, 'teacher'), ctrl.getAcademicReport);
router.get('/students',   authorize(...REPORT_ROLES, 'teacher'), ctrl.getStudentReport);

module.exports = router;
