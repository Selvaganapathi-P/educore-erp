const router  = require('express').Router();
const ctrl    = require('./inventory.controller');
const { authenticate }  = require('../../middleware/auth.middleware');
const { requireTenant } = require('../../middleware/tenant.middleware');
const { authorize }     = require('../../middleware/rbac.middleware');
const { validate }      = require('../../middleware/validate.middleware');
const { createItemSchema, updateItemSchema, stockMovementSchema } = require('./inventory.schema');

const MANAGERS = ['school_admin','principal','store_manager','accountant'];
const VIEWERS  = [...MANAGERS, 'vice_principal','teacher','hr'];

router.use(authenticate, requireTenant);

router.get('/dashboard', authorize(...VIEWERS), ctrl.getDashboard);

router.route('/items')
  .get(authorize(...VIEWERS), ctrl.listItems)
  .post(authorize(...MANAGERS), validate(createItemSchema), ctrl.createItem);

router.route('/items/:id')
  .get(authorize(...VIEWERS), ctrl.getItem)
  .put(authorize(...MANAGERS), validate(updateItemSchema), ctrl.updateItem)
  .delete(authorize(...MANAGERS), ctrl.deleteItem);

router.route('/movements')
  .get(authorize(...VIEWERS), ctrl.listMovements)
  .post(authorize(...MANAGERS), validate(stockMovementSchema), ctrl.recordMovement);

module.exports = router;
