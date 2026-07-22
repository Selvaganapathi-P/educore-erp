const { Router } = require('express');
const ctrl = require('./auth.controller');
const { authenticate } = require('../../middleware/auth.middleware');
const { validate }     = require('../../middleware/validate.middleware');
const {
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  changePasswordSchema,
} = require('./auth.schema');

const router = Router();

router.post('/login',           validate(loginSchema),          ctrl.login);
router.post('/refresh',                                          ctrl.refresh);
router.post('/logout',          authenticate,                   ctrl.logout);
router.post('/forgot-password', validate(forgotPasswordSchema), ctrl.forgotPassword);
router.post('/reset-password',  validate(resetPasswordSchema),  ctrl.resetPassword);
router.put( '/change-password', authenticate, validate(changePasswordSchema), ctrl.changePassword);
router.get( '/me',              authenticate, ctrl.me);

module.exports = router;
