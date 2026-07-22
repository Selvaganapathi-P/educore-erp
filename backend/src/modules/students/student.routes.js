const express = require('express');
const router  = express.Router();
const ctrl    = require('./student.controller');
const { authenticate, authorize } = require('../../middleware/auth.middleware');
const { requireTenant } = require('../../middleware/tenant.middleware');
const { validate } = require('../../middleware/validate.middleware');
const { createStudentSchema, updateStudentSchema, listStudentsQuerySchema } = require('./student.schema');

const VIEW_ROLES   = ['super_admin','school_admin','principal','vice_principal','teacher','hr','nurse','counselor'];
const MANAGE_ROLES = ['super_admin','school_admin','principal','hr'];

router.use(authenticate, requireTenant);

router.get('/stats',               authorize(...MANAGE_ROLES), ctrl.getStats);
router.get('/',                    authorize(...VIEW_ROLES),   validate(listStudentsQuerySchema, 'query'), ctrl.list);
router.post('/',                   authorize(...MANAGE_ROLES), validate(createStudentSchema),              ctrl.create);
router.get('/by-user/:userId',     authorize(...VIEW_ROLES),   ctrl.getByUserId);
router.get('/:id',                 authorize(...VIEW_ROLES),   ctrl.getById);
router.put('/:id',                 authorize(...MANAGE_ROLES), validate(updateStudentSchema),              ctrl.update);
router.delete('/:id',              authorize(...MANAGE_ROLES), ctrl.remove);

module.exports = router;
