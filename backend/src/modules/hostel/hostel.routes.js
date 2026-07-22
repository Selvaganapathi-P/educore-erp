const express = require('express');
const router  = express.Router();
const ctrl    = require('./hostel.controller');
const { authenticate, authorize } = require('../../middleware/auth.middleware');
const { requireTenant }           = require('../../middleware/tenant.middleware');
const { validate }                = require('../../middleware/validate.middleware');
const { createHostelSchema, createRoomSchema, allotStudentSchema, vacateSchema } = require('./hostel.schema');

const ADMIN  = ['super_admin','school_admin','principal'];
const WARDEN = [...ADMIN, 'hostel_warden'];
const VIEW   = [...WARDEN, 'teacher','student','parent'];

router.use(authenticate, requireTenant);

router.get('/dashboard', authorize(...WARDEN), ctrl.dashboard);

// Hostels
router.post  ('/hostels',     authorize(...ADMIN),  validate(createHostelSchema), ctrl.createHostel);
router.get   ('/hostels',     authorize(...VIEW),   ctrl.listHostels);
router.get   ('/hostels/:id', authorize(...VIEW),   ctrl.getHostel);
router.put   ('/hostels/:id', authorize(...ADMIN),  ctrl.updateHostel);
router.delete('/hostels/:id', authorize(...ADMIN),  ctrl.deleteHostel);

// Rooms
router.post  ('/rooms',     authorize(...WARDEN), validate(createRoomSchema), ctrl.createRoom);
router.get   ('/rooms',     authorize(...VIEW),   ctrl.listRooms);
router.put   ('/rooms/:id', authorize(...WARDEN), ctrl.updateRoom);
router.delete('/rooms/:id', authorize(...ADMIN),  ctrl.deleteRoom);

// Allotments
router.post  ('/allotments',               authorize(...WARDEN), validate(allotStudentSchema), ctrl.allotStudent);
router.get   ('/allotments',               authorize(...VIEW),   ctrl.listAllotments);
router.get   ('/rooms/:roomId/allotments', authorize(...WARDEN), ctrl.getRoomAllotments);
router.patch ('/allotments/:id/vacate',    authorize(...WARDEN), validate(vacateSchema), ctrl.vacateStudent);

module.exports = router;
