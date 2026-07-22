const express = require('express');
const router  = express.Router();
const ctrl    = require('./communication.controller');
const { authenticate, authorize } = require('../../middleware/auth.middleware');
const { requireTenant }           = require('../../middleware/tenant.middleware');
const { validate }                = require('../../middleware/validate.middleware');
const { createAnnouncementSchema, sendMessageSchema } = require('./communication.schema');

const ADMIN    = ['super_admin','school_admin','principal','vice_principal'];
const STAFF    = [...ADMIN, 'teacher','accountant','hr','librarian','nurse','receptionist'];
const ALL      = [...STAFF, 'student','parent'];

router.use(authenticate, requireTenant);

// ── Announcements ─────────────────────────────────────────────────────────────
router.post  ('/announcements',          authorize(...STAFF), validate(createAnnouncementSchema), ctrl.createAnnouncement);
router.get   ('/announcements',          authorize(...ALL),   ctrl.listAnnouncements);
router.get   ('/announcements/:id',      authorize(...ALL),   ctrl.getAnnouncement);
router.put   ('/announcements/:id',      authorize(...STAFF), ctrl.updateAnnouncement);
router.patch ('/announcements/:id/publish', authorize(...ADMIN),  ctrl.publishAnnouncement);
router.delete('/announcements/:id',      authorize(...ADMIN), ctrl.deleteAnnouncement);

// ── Messages ──────────────────────────────────────────────────────────────────
router.get   ('/messages/inbox',         authorize(...ALL),   ctrl.getInbox);
router.get   ('/messages/sent',          authorize(...ALL),   ctrl.getSent);
router.get   ('/messages/unread-count',  authorize(...ALL),   ctrl.unreadCount);
router.get   ('/messages/contacts',      authorize(...ALL),   ctrl.listContacts);
router.post  ('/messages',               authorize(...ALL),   validate(sendMessageSchema), ctrl.sendMessage);
router.get   ('/messages/thread/:threadId', authorize(...ALL), ctrl.getThread);
router.patch ('/messages/:id/read',      authorize(...ALL),   ctrl.markRead);
router.delete('/messages/:id',           authorize(...ALL),   ctrl.deleteMessage);

module.exports = router;
