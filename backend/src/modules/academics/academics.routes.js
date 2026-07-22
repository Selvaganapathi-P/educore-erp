const express = require('express');
const router  = express.Router();
const ctrl    = require('./academics.controller');
const { authenticate, authorize } = require('../../middleware/auth.middleware');
const { requireTenant } = require('../../middleware/tenant.middleware');
const { validate } = require('../../middleware/validate.middleware');
const s = require('./academics.schema');

const ADMIN = ['super_admin','school_admin','principal'];
const VIEW  = [...ADMIN, 'vice_principal','teacher','hr','it_administrator'];

router.use(authenticate, requireTenant);

// ── Academic Years ─────────────────────────────────────────────────────────────
router.get ('/years',                    authorize(...VIEW),  ctrl.listYears);
router.post('/years',                    authorize(...ADMIN), validate(s.createAcademicYearSchema),  ctrl.createYear);
router.get ('/years/:id',                authorize(...VIEW),  ctrl.getYear);
router.put ('/years/:id',                authorize(...ADMIN), ctrl.updateYear);
router.delete('/years/:id',              authorize(...ADMIN), ctrl.deleteYear);
router.post('/years/:id/holidays',       authorize(...ADMIN), validate(s.addHolidaySchema), ctrl.addHoliday);
router.delete('/years/:id/holidays/:hid',authorize(...ADMIN), ctrl.removeHoliday);

// ── Classes ───────────────────────────────────────────────────────────────────
router.get ('/classes',                  authorize(...VIEW),  ctrl.listClasses);
router.post('/classes',                  authorize(...ADMIN), validate(s.createClassSchema),  ctrl.createClass);
router.get ('/classes/:id',              authorize(...VIEW),  ctrl.getClass);
router.put ('/classes/:id',              authorize(...ADMIN), validate(s.updateClassSchema),  ctrl.updateClass);
router.delete('/classes/:id',            authorize(...ADMIN), ctrl.deleteClass);
router.post('/classes/:id/sections',     authorize(...ADMIN), validate(s.addSectionSchema),   ctrl.addSection);
router.put ('/classes/:id/sections/:sid',authorize(...ADMIN), ctrl.updateSection);
router.delete('/classes/:id/sections/:sid',authorize(...ADMIN), ctrl.deleteSection);

// ── Subjects ──────────────────────────────────────────────────────────────────
router.get ('/subjects',                 authorize(...VIEW),  ctrl.listSubjects);
router.post('/subjects',                 authorize(...ADMIN), validate(s.createSubjectSchema), ctrl.createSubject);
router.get ('/subjects/:id',             authorize(...VIEW),  ctrl.getSubject);
router.put ('/subjects/:id',             authorize(...ADMIN), validate(s.updateSubjectSchema), ctrl.updateSubject);
router.patch('/subjects/:id/assign',     authorize(...ADMIN), ctrl.assignTeacher);
router.delete('/subjects/:id',           authorize(...ADMIN), ctrl.deleteSubject);

// ── Timetable ─────────────────────────────────────────────────────────────────
router.get ('/timetable',                         authorize(...VIEW),  ctrl.getTimetable);
router.post('/timetable',                         authorize(...ADMIN), validate(s.saveTimetableSchema), ctrl.saveTimetable);
router.get ('/timetable/teacher/:teacherId',      authorize(...VIEW),  ctrl.getTeacherTimetable);

module.exports = router;
