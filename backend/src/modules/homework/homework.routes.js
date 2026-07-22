const express = require('express');
const router  = express.Router();
const ctrl    = require('./homework.controller');
const { authenticate, authorize } = require('../../middleware/auth.middleware');
const { requireTenant } = require('../../middleware/tenant.middleware');
const { validate } = require('../../middleware/validate.middleware');
const { createHomeworkSchema, submitSchema, gradeSchema } = require('./homework.schema');

const ADMIN   = ['super_admin','school_admin','principal'];
const TEACHER = [...ADMIN, 'vice_principal','teacher'];
const STUDENT = ['student'];

router.use(authenticate, requireTenant);

// Student-specific routes (must come before /:id to avoid route conflict)
router.get('/student/my', authorize(...STUDENT), ctrl.studentList);

// Teacher / admin routes
router.post('/',    authorize(...TEACHER), validate(createHomeworkSchema), ctrl.create);
router.get ('/',    authorize(...TEACHER), ctrl.list);
router.get ('/:id', authorize(...TEACHER, ...STUDENT), ctrl.getOne);
router.put ('/:id', authorize(...TEACHER), ctrl.update);

router.patch ('/:id/publish', authorize(...TEACHER), ctrl.publish);
router.patch ('/:id/close',   authorize(...TEACHER), ctrl.close);
router.delete('/:id',         authorize(...TEACHER), ctrl.remove);

router.get ('/:id/submissions',              authorize(...TEACHER), ctrl.getSubmissions);
router.get ('/:id/stats',                    authorize(...TEACHER), ctrl.stats);
router.post('/:id/submit',                   authorize(...STUDENT), validate(submitSchema), ctrl.submit);
router.patch('/:id/submissions/:subId/grade',authorize(...TEACHER), validate(gradeSchema),  ctrl.grade);

module.exports = router;
