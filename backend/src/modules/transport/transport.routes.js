const express = require('express');
const router  = express.Router();
const ctrl    = require('./transport.controller');
const { authenticate, authorize } = require('../../middleware/auth.middleware');
const { requireTenant }           = require('../../middleware/tenant.middleware');
const { validate }                = require('../../middleware/validate.middleware');
const { createVehicleSchema, createRouteSchema, assignStudentSchema } = require('./transport.schema');

const ADMIN   = ['super_admin','school_admin','principal'];
const MANAGER = [...ADMIN, 'transport_manager'];
const VIEW    = [...MANAGER, 'teacher','student','parent'];

router.use(authenticate, requireTenant);

router.get('/dashboard', authorize(...MANAGER), ctrl.dashboard);

// Vehicles
router.post  ('/vehicles',     authorize(...MANAGER), validate(createVehicleSchema), ctrl.createVehicle);
router.get   ('/vehicles',     authorize(...VIEW),    ctrl.listVehicles);
router.get   ('/vehicles/:id', authorize(...VIEW),    ctrl.getVehicle);
router.put   ('/vehicles/:id', authorize(...MANAGER), ctrl.updateVehicle);
router.delete('/vehicles/:id', authorize(...ADMIN),   ctrl.deleteVehicle);

// Routes
router.post  ('/routes',     authorize(...MANAGER), validate(createRouteSchema), ctrl.createRoute);
router.get   ('/routes',     authorize(...VIEW),    ctrl.listRoutes);
router.get   ('/routes/:id', authorize(...VIEW),    ctrl.getRoute);
router.put   ('/routes/:id', authorize(...MANAGER), ctrl.updateRoute);
router.delete('/routes/:id', authorize(...ADMIN),   ctrl.deleteRoute);

// Student transport
router.post  ('/students',                    authorize(...MANAGER), validate(assignStudentSchema), ctrl.assignStudent);
router.get   ('/students',                    authorize(...VIEW),    ctrl.getStudentTransport);
router.get   ('/routes/:routeId/students',    authorize(...MANAGER), ctrl.listStudentsByRoute);
router.patch ('/students/:id/remove',         authorize(...MANAGER), ctrl.removeStudentTransport);

module.exports = router;
