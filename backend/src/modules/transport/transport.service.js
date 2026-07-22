const mongoose = require('mongoose');
const dayjs     = require('dayjs');
const Vehicle        = require('./vehicle.model');
const Route          = require('./route.model');
const StudentTransport = require('./studentTransport.model');

// ── Vehicles ──────────────────────────────────────────────────────────────────

async function createVehicle(schoolId, body) {
  return Vehicle.create({
    schoolId,
    registrationNo:  body.registrationNo,
    vehicleType:     body.vehicleType     || 'bus',
    model:           body.model           || '',
    capacity:        Number(body.capacity),
    color:           body.color           || '',
    driverId:        body.driverId        || undefined,
    conductorId:     body.conductorId     || undefined,
    routeId:         body.routeId         || undefined,
    insuranceExpiry: body.insuranceExpiry ? new Date(body.insuranceExpiry) : undefined,
    pucExpiry:       body.pucExpiry       ? new Date(body.pucExpiry)       : undefined,
    fitnessExpiry:   body.fitnessExpiry   ? new Date(body.fitnessExpiry)   : undefined,
    notes:           body.notes           || '',
  });
}

async function listVehicles(schoolId, query) {
  const filter = { schoolId, isDeleted: false };
  if (query.status) filter.status = query.status;

  return Vehicle.find(filter)
    .populate('driverId',   'userId designation')
    .populate('conductorId','userId designation')
    .populate('routeId',    'name')
    .sort({ createdAt: -1 });
}

async function getVehicle(schoolId, id) {
  const v = await Vehicle.findOne({ _id: id, schoolId, isDeleted: false })
    .populate({ path: 'driverId',    populate: { path: 'userId', select: 'profile.firstName profile.lastName' } })
    .populate({ path: 'conductorId', populate: { path: 'userId', select: 'profile.firstName profile.lastName' } })
    .populate('routeId', 'name stops');
  if (!v) throw Object.assign(new Error('Vehicle not found'), { status: 404 });
  return v;
}

async function updateVehicle(schoolId, id, body) {
  const v = await Vehicle.findOne({ _id: id, schoolId, isDeleted: false });
  if (!v) throw Object.assign(new Error('Vehicle not found'), { status: 404 });

  const allowed = ['registrationNo','vehicleType','model','capacity','color','driverId','conductorId','routeId','status','notes'];
  for (const k of allowed) if (body[k] !== undefined) v[k] = body[k] || undefined;

  const dateFields = ['insuranceExpiry','pucExpiry','fitnessExpiry'];
  for (const k of dateFields) if (body[k]) v[k] = new Date(body[k]);

  return v.save();
}

async function deleteVehicle(schoolId, id) {
  const v = await Vehicle.findOne({ _id: id, schoolId, isDeleted: false });
  if (!v) throw Object.assign(new Error('Vehicle not found'), { status: 404 });
  v.isDeleted = true; v.deletedAt = new Date();
  return v.save();
}

// ── Routes ────────────────────────────────────────────────────────────────────

async function createRoute(schoolId, body) {
  const stops = (body.stops ?? [])
    .sort((a, b) => a.order - b.order)
    .map((s, i) => ({ ...s, order: i + 1 }));

  const route = await Route.create({
    schoolId,
    name:      body.name,
    vehicleId: body.vehicleId || undefined,
    stops,
    notes:     body.notes || '',
  });

  if (body.vehicleId) {
    await Vehicle.findOneAndUpdate(
      { _id: body.vehicleId, schoolId },
      { $set: { routeId: route._id } }
    );
  }
  return route;
}

async function listRoutes(schoolId, query) {
  const filter = { schoolId, isDeleted: false };
  if (query.isActive !== undefined) filter.isActive = query.isActive === 'true';

  return Route.find(filter)
    .populate('vehicleId', 'registrationNo vehicleType capacity')
    .sort({ name: 1 });
}

async function getRoute(schoolId, id) {
  const route = await Route.findOne({ _id: id, schoolId, isDeleted: false })
    .populate('vehicleId', 'registrationNo vehicleType capacity model');
  if (!route) throw Object.assign(new Error('Route not found'), { status: 404 });

  const enrollment = await StudentTransport.countDocuments({ schoolId, routeId: id, isActive: true });
  return { ...route.toObject(), enrollmentCount: enrollment };
}

async function updateRoute(schoolId, id, body) {
  const route = await Route.findOne({ _id: id, schoolId, isDeleted: false });
  if (!route) throw Object.assign(new Error('Route not found'), { status: 404 });

  if (body.name      !== undefined) route.name      = body.name;
  if (body.notes     !== undefined) route.notes     = body.notes;
  if (body.isActive  !== undefined) route.isActive  = body.isActive;
  if (body.vehicleId !== undefined) route.vehicleId = body.vehicleId || undefined;
  if (body.stops) {
    route.stops = body.stops.sort((a, b) => a.order - b.order).map((s, i) => ({ ...s, order: i + 1 }));
  }

  return route.save();
}

async function deleteRoute(schoolId, id) {
  const active = await StudentTransport.countDocuments({ schoolId, routeId: id, isActive: true });
  if (active) throw Object.assign(new Error(`Route has ${active} active students — reassign first`), { status: 400 });

  const route = await Route.findOne({ _id: id, schoolId, isDeleted: false });
  if (!route) throw Object.assign(new Error('Route not found'), { status: 404 });
  route.isDeleted = true; route.deletedAt = new Date();
  return route.save();
}

// ── Student Assignments ───────────────────────────────────────────────────────

async function assignStudent(schoolId, body) {
  const Student = require('../students/student.model');
  const student = await Student.findOne({ _id: body.studentId, schoolId }).select('userId').lean();
  if (!student) throw Object.assign(new Error('Student not found'), { status: 404 });

  const route = await Route.findOne({ _id: body.routeId, schoolId, isDeleted: false });
  if (!route) throw Object.assign(new Error('Route not found'), { status: 404 });

  const validStop = route.stops.some(s => s.name === body.stopName);
  if (!validStop) throw Object.assign(new Error(`Stop "${body.stopName}" not found on this route`), { status: 400 });

  const record = await StudentTransport.findOneAndUpdate(
    { schoolId, studentId: body.studentId, academicYearId: body.academicYearId },
    {
      $set: {
        routeId:       body.routeId,
        stopName:      body.stopName,
        transportType: body.transportType || 'both',
        feeAmount:     body.feeAmount     || 0,
        userId:        student.userId,
        isActive:      true,
      },
    },
    { upsert: true, new: true }
  );

  return record.populate([
    { path: 'studentId', select: 'rollNumber' },
    { path: 'userId',    select: 'profile.firstName profile.lastName' },
    { path: 'routeId',   select: 'name' },
  ]);
}

async function removeStudentTransport(schoolId, id) {
  const rec = await StudentTransport.findOne({ _id: id, schoolId });
  if (!rec) throw Object.assign(new Error('Record not found'), { status: 404 });
  rec.isActive = false;
  return rec.save();
}

async function listStudentsByRoute(schoolId, routeId) {
  return StudentTransport.find({ schoolId, routeId, isActive: true })
    .populate('studentId', 'rollNumber currentClass')
    .populate('userId',    'profile.firstName profile.lastName')
    .populate({ path: 'studentId', populate: { path: 'currentClass', select: 'name' } })
    .sort({ stopName: 1 });
}

async function getStudentTransport(schoolId, studentId, academicYearId) {
  return StudentTransport.findOne({ schoolId, studentId, academicYearId, isActive: true })
    .populate('routeId', 'name stops vehicleId')
    .populate({ path: 'routeId', populate: { path: 'vehicleId', select: 'registrationNo vehicleType' } });
}

// ── Dashboard ─────────────────────────────────────────────────────────────────

async function getDashboard(schoolId) {
  const sid = new mongoose.Types.ObjectId(schoolId);
  const now = new Date();

  const [vehicles, routes, enrolled, byStatus, expiring] = await Promise.all([
    Vehicle.countDocuments({ schoolId, isDeleted: false }),
    Route.countDocuments({ schoolId, isDeleted: false, isActive: true }),
    StudentTransport.countDocuments({ schoolId, isActive: true }),
    Vehicle.aggregate([
      { $match: { schoolId: sid, isDeleted: false } },
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]),
    Vehicle.find({
      schoolId, isDeleted: false,
      $or: [
        { insuranceExpiry: { $lt: dayjs().add(30,'day').toDate() } },
        { pucExpiry:       { $lt: dayjs().add(30,'day').toDate() } },
        { fitnessExpiry:   { $lt: dayjs().add(30,'day').toDate() } },
      ],
    }).select('registrationNo insuranceExpiry pucExpiry fitnessExpiry').lean(),
  ]);

  const statusMap = Object.fromEntries(byStatus.map(s => [s._id, s.count]));

  return {
    totalVehicles: vehicles,
    totalRoutes:   routes,
    enrolledStudents: enrolled,
    activeVehicles:   statusMap.active || 0,
    maintenanceCount: statusMap.maintenance || 0,
    expiringDocs: expiring,
  };
}

module.exports = {
  createVehicle, listVehicles, getVehicle, updateVehicle, deleteVehicle,
  createRoute,   listRoutes,   getRoute,   updateRoute,   deleteRoute,
  assignStudent, removeStudentTransport, listStudentsByRoute, getStudentTransport,
  getDashboard,
};
