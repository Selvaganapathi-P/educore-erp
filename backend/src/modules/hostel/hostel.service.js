const mongoose       = require('mongoose');
const Hostel         = require('./hostel.model');
const Room           = require('./room.model');
const HostelAllotment = require('./hostelAllotment.model');

// ── Hostels ───────────────────────────────────────────────────────────────────

async function createHostel(schoolId, body) {
  return Hostel.create({
    schoolId,
    name:         body.name,
    type:         body.type,
    wardenId:     body.wardenId     || undefined,
    address:      body.address      || '',
    contactPhone: body.contactPhone || '',
    amenities:    body.amenities    || [],
  });
}

async function listHostels(schoolId) {
  const hostels = await Hostel.find({ schoolId, isDeleted: false })
    .populate({ path: 'wardenId', populate: { path: 'userId', select: 'profile.firstName profile.lastName' } })
    .sort({ name: 1 });

  // Attach per-hostel room stats
  const ids = hostels.map(h => h._id);
  const roomStats = await Room.aggregate([
    { $match: { schoolId: new mongoose.Types.ObjectId(schoolId), hostelId: { $in: ids }, isDeleted: false } },
    { $group: { _id: '$hostelId', totalRooms: { $sum: 1 }, totalBeds: { $sum: '$capacity' }, occupiedBeds: { $sum: '$occupiedBeds' } } },
  ]);
  const statsMap = Object.fromEntries(roomStats.map(s => [String(s._id), s]));

  return hostels.map(h => ({
    ...h.toObject(),
    _stats: statsMap[String(h._id)] ?? { totalRooms: 0, totalBeds: 0, occupiedBeds: 0 },
  }));
}

async function getHostel(schoolId, id) {
  const hostel = await Hostel.findOne({ _id: id, schoolId, isDeleted: false })
    .populate({ path: 'wardenId', populate: { path: 'userId', select: 'profile.firstName profile.lastName' } });
  if (!hostel) throw Object.assign(new Error('Hostel not found'), { status: 404 });
  return hostel;
}

async function updateHostel(schoolId, id, body) {
  const h = await Hostel.findOne({ _id: id, schoolId, isDeleted: false });
  if (!h) throw Object.assign(new Error('Hostel not found'), { status: 404 });
  const allowed = ['name','type','wardenId','address','contactPhone','amenities','isActive'];
  for (const k of allowed) if (body[k] !== undefined) h[k] = body[k] || (Array.isArray(body[k]) ? body[k] : undefined);
  return h.save();
}

async function deleteHostel(schoolId, id) {
  const active = await HostelAllotment.countDocuments({ schoolId, hostelId: id, status: 'active' });
  if (active) throw Object.assign(new Error(`Hostel has ${active} active residents`), { status: 400 });
  const h = await Hostel.findOne({ _id: id, schoolId, isDeleted: false });
  if (!h) throw Object.assign(new Error('Hostel not found'), { status: 404 });
  h.isDeleted = true; h.deletedAt = new Date();
  return h.save();
}

// ── Rooms ─────────────────────────────────────────────────────────────────────

async function createRoom(schoolId, body) {
  const room = await Room.create({
    schoolId,
    hostelId:   body.hostelId,
    roomNumber: body.roomNumber,
    floor:      body.floor      || 'G',
    roomType:   body.roomType   || 'double',
    capacity:   Number(body.capacity),
    monthlyFee: Number(body.monthlyFee) || 0,
    amenities:  body.amenities  || [],
    notes:      body.notes      || '',
  });
  return room;
}

async function listRooms(schoolId, hostelId, query) {
  const filter = { schoolId, isDeleted: false };
  if (hostelId)      filter.hostelId = hostelId;
  if (query?.status) filter.status   = query.status;

  return Room.find(filter).sort({ floor: 1, roomNumber: 1 });
}

async function updateRoom(schoolId, id, body) {
  const room = await Room.findOne({ _id: id, schoolId, isDeleted: false });
  if (!room) throw Object.assign(new Error('Room not found'), { status: 404 });
  const allowed = ['roomNumber','floor','roomType','capacity','monthlyFee','amenities','status','notes'];
  for (const k of allowed) if (body[k] !== undefined) room[k] = body[k];
  return room.save();
}

async function deleteRoom(schoolId, id) {
  const room = await Room.findOne({ _id: id, schoolId, isDeleted: false });
  if (!room) throw Object.assign(new Error('Room not found'), { status: 404 });
  if (room.occupiedBeds > 0) throw Object.assign(new Error('Room has occupants — vacate first'), { status: 400 });
  room.isDeleted = true; room.deletedAt = new Date();
  return room.save();
}

// ── Allotments ────────────────────────────────────────────────────────────────

async function allotStudent(schoolId, body, allottedBy) {
  const room = await Room.findOne({ _id: body.roomId, schoolId, hostelId: body.hostelId, isDeleted: false });
  if (!room) throw Object.assign(new Error('Room not found'), { status: 404 });

  const availBeds = room.capacity - room.occupiedBeds;
  if (availBeds < 1) throw Object.assign(new Error('Room is full'), { status: 400 });

  // Check existing active allotment
  const existing = await HostelAllotment.findOne({ schoolId, studentId: body.studentId, academicYearId: body.academicYearId, status: 'active' });
  if (existing) throw Object.assign(new Error('Student already has an active allotment this year'), { status: 400 });

  // Resolve userId
  const Student = require('../students/student.model');
  const student = await Student.findOne({ _id: body.studentId, schoolId }).select('userId').lean();
  if (!student) throw Object.assign(new Error('Student not found'), { status: 404 });

  const allotment = await HostelAllotment.create({
    schoolId,
    studentId:      body.studentId,
    userId:         student.userId,
    hostelId:       body.hostelId,
    roomId:         body.roomId,
    academicYearId: body.academicYearId,
    bedNumber:      body.bedNumber || '',
    joinDate:       body.joinDate ? new Date(body.joinDate) : new Date(),
    feeAmount:      Number(body.feeAmount) || room.monthlyFee,
    allottedBy,
  });

  room.occupiedBeds += 1;
  if (room.occupiedBeds >= room.capacity) room.status = 'full';
  await room.save();

  return allotment.populate([
    { path: 'studentId', select: 'rollNumber' },
    { path: 'userId',    select: 'profile.firstName profile.lastName' },
    { path: 'hostelId',  select: 'name' },
    { path: 'roomId',    select: 'roomNumber floor' },
  ]);
}

async function vacateStudent(schoolId, allotmentId, body) {
  const allotment = await HostelAllotment.findOne({ _id: allotmentId, schoolId, status: 'active' });
  if (!allotment) throw Object.assign(new Error('Active allotment not found'), { status: 404 });

  allotment.status     = 'left';
  allotment.leaveDate  = body.leaveDate ? new Date(body.leaveDate) : new Date();
  allotment.leftReason = body.leftReason || '';
  await allotment.save();

  const room = await Room.findById(allotment.roomId);
  if (room) {
    room.occupiedBeds = Math.max(0, room.occupiedBeds - 1);
    if (room.status === 'full') room.status = 'available';
    await room.save();
  }

  return allotment;
}

async function listAllotments(schoolId, query) {
  const filter = { schoolId };
  if (query.hostelId)       filter.hostelId       = query.hostelId;
  if (query.roomId)         filter.roomId         = query.roomId;
  if (query.academicYearId) filter.academicYearId = query.academicYearId;
  filter.status = query.status || 'active';

  const page  = Math.max(Number(query.page) || 1, 1);
  const limit = Math.min(Number(query.limit) || 30, 100);

  const [data, total] = await Promise.all([
    HostelAllotment.find(filter)
      .populate('studentId', 'rollNumber')
      .populate('userId',    'profile.firstName profile.lastName')
      .populate('hostelId',  'name type')
      .populate('roomId',    'roomNumber floor roomType')
      .sort({ joinDate: -1 })
      .skip((page - 1) * limit)
      .limit(limit),
    HostelAllotment.countDocuments(filter),
  ]);

  return { data, total, page, pages: Math.ceil(total / limit) };
}

async function getRoomAllotments(schoolId, roomId) {
  return HostelAllotment.find({ schoolId, roomId, status: 'active' })
    .populate('studentId', 'rollNumber')
    .populate('userId',    'profile.firstName profile.lastName')
    .sort({ bedNumber: 1 });
}

// ── Dashboard ─────────────────────────────────────────────────────────────────

async function getDashboard(schoolId) {
  const sid = new mongoose.Types.ObjectId(schoolId);

  const [hostelCount, roomStats, occupancyStats, byType] = await Promise.all([
    Hostel.countDocuments({ schoolId, isDeleted: false, isActive: true }),
    Room.aggregate([
      { $match: { schoolId: sid, isDeleted: false } },
      { $group: { _id: null, totalRooms: { $sum: 1 }, totalBeds: { $sum: '$capacity' }, occupiedBeds: { $sum: '$occupiedBeds' }, available: { $sum: { $subtract: ['$capacity','$occupiedBeds'] } } } },
    ]),
    HostelAllotment.countDocuments({ schoolId, status: 'active' }),
    Hostel.aggregate([
      { $match: { schoolId: sid, isDeleted: false } },
      { $group: { _id: '$type', count: { $sum: 1 } } },
    ]),
  ]);

  const rs = roomStats[0] ?? {};
  const typeMap = Object.fromEntries(byType.map(t => [t._id, t.count]));

  return {
    totalHostels:    hostelCount,
    totalRooms:      rs.totalRooms   ?? 0,
    totalBeds:       rs.totalBeds    ?? 0,
    occupiedBeds:    rs.occupiedBeds ?? 0,
    availableBeds:   rs.available    ?? 0,
    activeResidents: occupancyStats,
    occupancyPct:    rs.totalBeds ? Math.round((rs.occupiedBeds / rs.totalBeds) * 100) : 0,
    byType:          typeMap,
  };
}

module.exports = {
  createHostel, listHostels, getHostel, updateHostel, deleteHostel,
  createRoom,   listRooms,   updateRoom,   deleteRoom,
  allotStudent, vacateStudent, listAllotments, getRoomAllotments,
  getDashboard,
};
