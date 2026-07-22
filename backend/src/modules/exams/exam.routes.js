const express = require('express');
const router  = express.Router();
const ctrl    = require('./exam.controller');
const { authenticate, authorize } = require('../../middleware/auth.middleware');
const { requireTenant } = require('../../middleware/tenant.middleware');
const { validate } = require('../../middleware/validate.middleware');
const { createExamSchema, addScheduleSchema, enterMarksSchema } = require('./exam.schema');

const ADMIN   = ['super_admin','school_admin','principal'];
const TEACHER = [...ADMIN, 'vice_principal','teacher'];
const VIEW    = [...TEACHER, 'student','parent','accountant'];

router.use(authenticate, requireTenant);

// Exams
router.post  ('/',                    authorize(...ADMIN),   validate(createExamSchema), ctrl.create);
router.get   ('/',                    authorize(...VIEW),    ctrl.list);
router.get   ('/:id',                 authorize(...VIEW),    ctrl.getOne);
router.put   ('/:id',                 authorize(...ADMIN),   ctrl.update);
router.patch ('/:id/publish',         authorize(...ADMIN),   ctrl.publish);
router.patch ('/:id/complete',        authorize(...ADMIN),   ctrl.complete);
router.delete('/:id',                 authorize(...ADMIN),   ctrl.remove);

// Schedule
router.post  ('/:id/schedule',        authorize(...ADMIN),   validate(addScheduleSchema), ctrl.addSchedule);
router.put   ('/:id/schedule/:sid',   authorize(...ADMIN),   ctrl.updateSchedule);
router.delete('/:id/schedule/:sid',   authorize(...ADMIN),   ctrl.deleteSchedule);

// Mark entry
router.get   ('/:id/students',        authorize(...TEACHER), ctrl.studentsForExam);
router.post  ('/:id/schedule/:sid/marks', authorize(...TEACHER), validate(enterMarksSchema), ctrl.enterMarks);
router.get   ('/:id/schedule/:sid/marks', authorize(...TEACHER), ctrl.getMarks);

// Results
router.post  ('/:id/results/calculate',  authorize(...ADMIN),   ctrl.calculate);
router.post  ('/:id/results/publish',    authorize(...ADMIN),   ctrl.publishResults);
router.get   ('/:id/results',            authorize(...VIEW),    ctrl.classResults);
router.get   ('/:id/results/:studentId', authorize(...VIEW),    ctrl.studentResult);

module.exports = router;
