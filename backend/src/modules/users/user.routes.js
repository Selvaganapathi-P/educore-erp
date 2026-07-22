const { Router } = require('express');
const ctrl = require('./user.controller');
const { authenticate, authorize } = require('../../middleware/auth.middleware');
const { validate } = require('../../middleware/validate.middleware');
const { createUserSchema, updateUserSchema, listUsersQuerySchema } = require('./user.schema');

const router = Router();
router.use(authenticate);

router.get('/',         authorize('super_admin','school_admin','principal','hr'), validate(listUsersQuerySchema, 'query'), ctrl.list);
router.post('/',        authorize('super_admin','school_admin','principal','hr'), validate(createUserSchema),              ctrl.create);
router.post('/invite',  authorize('super_admin','school_admin','principal','hr'), validate(createUserSchema),              ctrl.invite);
router.post('/bulk',    authorize('super_admin','school_admin','hr'),                                                      ctrl.bulkCreate);
router.get('/:id',                                                                                                         ctrl.getById);
router.put('/:id',      validate(updateUserSchema),                                                                        ctrl.update);
router.delete('/:id',   authorize('super_admin','school_admin','hr'),                                                      ctrl.remove);
router.patch('/:id/status', authorize('super_admin','school_admin','hr'),                                                  ctrl.updateStatus);

module.exports = router;
