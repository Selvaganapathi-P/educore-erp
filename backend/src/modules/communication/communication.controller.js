const svc = require('./communication.service');
const { asyncHandler }   = require('../../utils/asyncHandler');
const { createAuditLog } = require('../../utils/auditLog');

const h = asyncHandler;

// ── Announcements ─────────────────────────────────────────────────────────────

const createAnnouncement = h(async (req, res) => {
  const data = await svc.createAnnouncement(req.schoolId, req.user._id, req.body);
  await createAuditLog({ schoolId: req.schoolId, userId: req.user._id, action: 'ANNOUNCEMENT_CREATED', entity: 'Announcement', entityId: data._id, details: data.title });
  res.status(201).json({ success: true, data });
});

const listAnnouncements = h(async (req, res) => {
  const result = await svc.listAnnouncements(req.schoolId, req.user.role, req.query);
  res.json({ success: true, ...result });
});

const getAnnouncement = h(async (req, res) => {
  const data = await svc.getAnnouncement(req.schoolId, req.params.id);
  res.json({ success: true, data });
});

const updateAnnouncement = h(async (req, res) => {
  const data = await svc.updateAnnouncement(req.schoolId, req.params.id, req.body);
  res.json({ success: true, data });
});

const publishAnnouncement = h(async (req, res) => {
  const data = await svc.publishAnnouncement(req.schoolId, req.params.id);
  await createAuditLog({ schoolId: req.schoolId, userId: req.user._id, action: 'ANNOUNCEMENT_PUBLISHED', entity: 'Announcement', entityId: data._id });
  res.json({ success: true, data });
});

const deleteAnnouncement = h(async (req, res) => {
  await svc.deleteAnnouncement(req.schoolId, req.params.id);
  res.json({ success: true, message: 'Deleted' });
});

// ── Messages ──────────────────────────────────────────────────────────────────

const sendMessage   = h(async (req, res) => {
  const data = await svc.sendMessage(req.schoolId, req.user._id, req.body);
  res.status(201).json({ success: true, data });
});

const getInbox      = h(async (req, res) => {
  const result = await svc.getInbox(req.schoolId, req.user._id, req.query);
  res.json({ success: true, ...result });
});

const getSent       = h(async (req, res) => {
  const result = await svc.getSent(req.schoolId, req.user._id, req.query);
  res.json({ success: true, ...result });
});

const getThread     = h(async (req, res) => {
  const data = await svc.getThread(req.schoolId, req.params.threadId, req.user._id);
  res.json({ success: true, data });
});

const markRead      = h(async (req, res) => {
  const data = await svc.markRead(req.schoolId, req.params.id, req.user._id);
  res.json({ success: true, data });
});

const deleteMessage = h(async (req, res) => {
  await svc.deleteMessage(req.schoolId, req.params.id, req.user._id);
  res.json({ success: true, message: 'Deleted' });
});

const unreadCount   = h(async (req, res) => {
  const count = await svc.getUnreadCount(req.schoolId, req.user._id);
  res.json({ success: true, data: { count } });
});

const listContacts  = h(async (req, res) => {
  const data = await svc.listContacts(req.schoolId, req.query);
  res.json({ success: true, data });
});

module.exports = {
  createAnnouncement, listAnnouncements, getAnnouncement, updateAnnouncement, publishAnnouncement, deleteAnnouncement,
  sendMessage, getInbox, getSent, getThread, markRead, deleteMessage, unreadCount, listContacts,
};
