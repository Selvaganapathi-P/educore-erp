const router = require('express').Router();
const { authenticate, authorize } = require('../../middleware/auth.middleware');
const { requireTenant } = require('../../middleware/tenant.middleware');
const ctrl = require('./ai.controller');

const AI_ROLES = ['school_admin','principal','vice_principal','teacher','accountant','hr'];

router.use(authenticate, requireTenant);

router.post('/chat',                    authorize(...AI_ROLES), ctrl.streamChat);
router.get('/conversations',            authorize(...AI_ROLES), ctrl.listConversations);
router.get('/conversations/:id',        authorize(...AI_ROLES), ctrl.getConversation);
router.delete('/conversations/:id',     authorize(...AI_ROLES), ctrl.deleteConversation);
router.post('/insights',                authorize('school_admin','principal','vice_principal'), ctrl.generateInsights);
router.post('/content',                 authorize(...AI_ROLES), ctrl.generateContent);

module.exports = router;
