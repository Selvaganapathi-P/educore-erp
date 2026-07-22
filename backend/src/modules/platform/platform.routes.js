const express = require('express');
const router  = express.Router();
const { getDashboard } = require('./platform.controller');
const { authenticate, authorize } = require('../../middleware/auth.middleware');
const asyncHandler = fn => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

router.use(authenticate, authorize('super_admin'));
router.get('/dashboard', asyncHandler(getDashboard));

module.exports = router;
