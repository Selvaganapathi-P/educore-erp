const svc = require('./transport.service');
const { asyncHandler }   = require('../../utils/asyncHandler');
const { createAuditLog } = require('../../utils/auditLog');

const h = asyncHandler;

// Vehicles
const createVehicle = h(async (req, res) => {
  const data = await svc.createVehicle(req.schoolId, req.body);
  await createAuditLog({ schoolId: req.schoolId, userId: req.user._id, action: 'VEHICLE_ADDED', entity: 'Vehicle', entityId: data._id, details: data.registrationNo });
  res.status(201).json({ success: true, data });
});
const listVehicles  = h(async (req, res) => { const data = await svc.listVehicles(req.schoolId, req.query); res.json({ success: true, data }); });
const getVehicle    = h(async (req, res) => { const data = await svc.getVehicle(req.schoolId, req.params.id); res.json({ success: true, data }); });
const updateVehicle = h(async (req, res) => { const data = await svc.updateVehicle(req.schoolId, req.params.id, req.body); res.json({ success: true, data }); });
const deleteVehicle = h(async (req, res) => { await svc.deleteVehicle(req.schoolId, req.params.id); res.json({ success: true, message: 'Deleted' }); });

// Routes
const createRoute = h(async (req, res) => {
  const data = await svc.createRoute(req.schoolId, req.body);
  await createAuditLog({ schoolId: req.schoolId, userId: req.user._id, action: 'ROUTE_CREATED', entity: 'Route', entityId: data._id, details: data.name });
  res.status(201).json({ success: true, data });
});
const listRoutes  = h(async (req, res) => { const data = await svc.listRoutes(req.schoolId, req.query); res.json({ success: true, data }); });
const getRoute    = h(async (req, res) => { const data = await svc.getRoute(req.schoolId, req.params.id); res.json({ success: true, data }); });
const updateRoute = h(async (req, res) => { const data = await svc.updateRoute(req.schoolId, req.params.id, req.body); res.json({ success: true, data }); });
const deleteRoute = h(async (req, res) => { await svc.deleteRoute(req.schoolId, req.params.id); res.json({ success: true, message: 'Deleted' }); });

// Student transport
const assignStudent  = h(async (req, res) => {
  const data = await svc.assignStudent(req.schoolId, req.body);
  res.status(201).json({ success: true, data });
});
const removeStudentTransport = h(async (req, res) => {
  await svc.removeStudentTransport(req.schoolId, req.params.id);
  res.json({ success: true, message: 'Removed' });
});
const listStudentsByRoute = h(async (req, res) => {
  const data = await svc.listStudentsByRoute(req.schoolId, req.params.routeId);
  res.json({ success: true, data });
});
const getStudentTransport = h(async (req, res) => {
  const data = await svc.getStudentTransport(req.schoolId, req.query.studentId, req.query.academicYearId);
  res.json({ success: true, data });
});

// Dashboard
const dashboard = h(async (req, res) => { const data = await svc.getDashboard(req.schoolId); res.json({ success: true, data }); });

module.exports = {
  createVehicle, listVehicles, getVehicle, updateVehicle, deleteVehicle,
  createRoute,   listRoutes,   getRoute,   updateRoute,   deleteRoute,
  assignStudent, removeStudentTransport, listStudentsByRoute, getStudentTransport,
  dashboard,
};
