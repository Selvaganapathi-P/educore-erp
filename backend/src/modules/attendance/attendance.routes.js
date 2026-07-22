const express = require('express');
const router  = express.Router();
const ctrl    = require('./attendance.controller');
const { authenticate, authorize } = require('../../middleware/auth.middleware');
const { requireTenant } = require('../../middleware/tenant.middleware');
const { validate } = require('../../middleware/validate.middleware');
const { markStudentSchema, markStaffSchema } = require('./attendance.schema');

const ADMIN   = ['super_admin','school_admin','principal'];
const TEACHER = [...ADMIN, 'vice_principal','teacher'];
const VIEW    = [...TEACHER, 'hr','accountant','parent','student'];

router.use(authenticate, requireTenant);

// Student attendance
router.post('/students',               authorize(...TEACHER), validate(markStudentSchema), ctrl.markStudent);
router.get ('/students',               authorize(...VIEW),    ctrl.getStudentAttendance);
router.get ('/students/report',        authorize(...VIEW),    ctrl.studentReport);
router.get ('/students/class-report',  authorize(...TEACHER), ctrl.classMonthlyReport);
router.get ('/students/for-class',     authorize(...TEACHER), ctrl.studentsForClass);

// Staff attendance
router.post('/staff',         authorize(...ADMIN, 'hr'), validate(markStaffSchema), ctrl.markStaff);
router.get ('/staff',         authorize(...ADMIN, 'hr'), ctrl.getStaffAttendance);
router.get ('/staff/report',  authorize(...ADMIN, 'hr'), ctrl.staffReport);

// Automation
router.post('/auto-absent',   authorize(...ADMIN), ctrl.autoAbsent);

module.exports = router;
