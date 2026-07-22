const svc = require('./hostel.service');
const { asyncHandler }   = require('../../utils/asyncHandler');
const { createAuditLog } = require('../../utils/auditLog');

const h = asyncHandler;

// Hostels
const createHostel = h(async (req, res) => {
  const data = await svc.createHostel(req.schoolId, req.body);
  await createAuditLog({ schoolId: req.schoolId, userId: req.user._id, action: 'HOSTEL_CREATED', entity: 'Hostel', entityId: data._id, details: data.name });
  res.status(201).json({ success: true, data });
});
const listHostels  = h(async (req, res) => { const data = await svc.listHostels(req.schoolId); res.json({ success: true, data }); });
const getHostel    = h(async (req, res) => { const data = await svc.getHostel(req.schoolId, req.params.id); res.json({ success: true, data }); });
const updateHostel = h(async (req, res) => { const data = await svc.updateHostel(req.schoolId, req.params.id, req.body); res.json({ success: true, data }); });
const deleteHostel = h(async (req, res) => { await svc.deleteHostel(req.schoolId, req.params.id); res.json({ success: true, message: 'Deleted' }); });

// Rooms
const createRoom = h(async (req, res) => {
  const data = await svc.createRoom(req.schoolId, req.body);
  res.status(201).json({ success: true, data });
});
const listRooms  = h(async (req, res) => { const data = await svc.listRooms(req.schoolId, req.query.hostelId, req.query); res.json({ success: true, data }); });
const updateRoom = h(async (req, res) => { const data = await svc.updateRoom(req.schoolId, req.params.id, req.body); res.json({ success: true, data }); });
const deleteRoom = h(async (req, res) => { await svc.deleteRoom(req.schoolId, req.params.id); res.json({ success: true, message: 'Deleted' }); });

// Allotments
const allotStudent    = h(async (req, res) => {
  const data = await svc.allotStudent(req.schoolId, req.body, req.user._id);
  await createAuditLog({ schoolId: req.schoolId, userId: req.user._id, action: 'HOSTEL_ALLOTTED', entity: 'HostelAllotment', entityId: data._id });
  res.status(201).json({ success: true, data });
});
const vacateStudent   = h(async (req, res) => {
  const data = await svc.vacateStudent(req.schoolId, req.params.id, req.body);
  await createAuditLog({ schoolId: req.schoolId, userId: req.user._id, action: 'HOSTEL_VACATED', entity: 'HostelAllotment', entityId: data._id });
  res.json({ success: true, data });
});
const listAllotments  = h(async (req, res) => { const r = await svc.listAllotments(req.schoolId, req.query); res.json({ success: true, ...r }); });
const getRoomAllotments = h(async (req, res) => { const data = await svc.getRoomAllotments(req.schoolId, req.params.roomId); res.json({ success: true, data }); });

// Dashboard
const dashboard = h(async (req, res) => { const data = await svc.getDashboard(req.schoolId); res.json({ success: true, data }); });

module.exports = { createHostel, listHostels, getHostel, updateHostel, deleteHostel, createRoom, listRooms, updateRoom, deleteRoom, allotStudent, vacateStudent, listAllotments, getRoomAllotments, dashboard };
