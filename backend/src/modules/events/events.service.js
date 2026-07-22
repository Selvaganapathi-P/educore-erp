const mongoose = require('mongoose');
const dayjs    = require('dayjs');
const Event       = require('./event.model');
const Certificate = require('./certificate.model');
const { createAuditLog } = require('../../utils/auditLog');

// ── Certificate number ───────────────────────────────────────────────────────

async function nextCertNumber(schoolId) {
  const year = dayjs().year();
  const prefix = `CERT-${year}`;
  const last = await Certificate.findOne({ schoolId, certNumber: { $regex: `^${prefix}-` } })
    .sort({ certNumber: -1 })
    .lean();
  const seq = last
    ? parseInt(last.certNumber.split('-').pop() || '0', 10) + 1
    : 1;
  return `${prefix}-${String(seq).padStart(4, '0')}`;
}

// ── Events ────────────────────────────────────────────────────────────────────

async function listEvents(schoolId, { from, to, type, audience, published, page = 1, limit = 30 } = {}) {
  const filter = { schoolId, isDeleted: false };
  if (type)     filter.type           = type;
  if (audience) filter.targetAudience = audience;
  if (published !== undefined) filter.isPublished = published === 'true' || published === true;
  if (from || to) {
    filter.startDate = {};
    if (from) filter.startDate.$gte = new Date(from);
    if (to)   filter.startDate.$lte = dayjs(to).endOf('day').toDate();
  }
  const [data, total] = await Promise.all([
    Event.find(filter)
      .sort({ startDate: 1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate('organizerId', 'profile')
      .lean(),
    Event.countDocuments(filter),
  ]);
  return { data, total, page: Number(page), pages: Math.ceil(total / limit) };
}

async function getEvent(schoolId, eventId) {
  return Event.findOne({ _id: eventId, schoolId, isDeleted: false }).populate('organizerId','profile').lean();
}

async function createEvent(schoolId, body, userId) {
  const event = await Event.create({
    schoolId, ...body,
    startDate: new Date(body.startDate),
    endDate:   body.endDate ? new Date(body.endDate) : undefined,
    organizerId: userId,
  });
  await createAuditLog({ schoolId, userId, action: 'CREATE', resource: 'Event', resourceId: event._id, detail: event.title });
  return event;
}

async function updateEvent(schoolId, eventId, body, userId) {
  const upd = { ...body };
  if (body.startDate) upd.startDate = new Date(body.startDate);
  if (body.endDate)   upd.endDate   = new Date(body.endDate);
  const event = await Event.findOneAndUpdate(
    { _id: eventId, schoolId, isDeleted: false },
    { $set: upd },
    { new: true, runValidators: true },
  );
  if (!event) throw Object.assign(new Error('Event not found'), { status: 404 });
  await createAuditLog({ schoolId, userId, action: 'UPDATE', resource: 'Event', resourceId: event._id, detail: event.title });
  return event;
}

async function deleteEvent(schoolId, eventId, userId) {
  const event = await Event.findOneAndUpdate(
    { _id: eventId, schoolId, isDeleted: false },
    { $set: { isDeleted: true, deletedAt: new Date() } },
    { new: true },
  );
  if (!event) throw Object.assign(new Error('Event not found'), { status: 404 });
  await createAuditLog({ schoolId, userId, action: 'DELETE', resource: 'Event', resourceId: event._id });
}

// ── Certificates ──────────────────────────────────────────────────────────────

async function listCertificates(schoolId, { recipientId, type, status, page = 1, limit = 30 } = {}) {
  const filter = { schoolId, isDeleted: false };
  if (recipientId) filter.recipientId = recipientId;
  if (type)        filter.type        = type;
  if (status)      filter.status      = status;
  const [data, total] = await Promise.all([
    Certificate.find(filter)
      .sort({ issuedDate: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate({ path: 'recipientId', select: 'rollNumber employeeId userId', populate: { path: 'userId', select: 'profile' } })
      .populate('issuedBy', 'profile')
      .populate('academicYearId', 'name')
      .lean(),
    Certificate.countDocuments(filter),
  ]);
  return { data, total, page: Number(page), pages: Math.ceil(total / limit) };
}

async function getCertificate(schoolId, certId) {
  return Certificate.findOne({ _id: certId, schoolId, isDeleted: false })
    .populate({ path: 'recipientId', select: 'rollNumber employeeId userId class section', populate: [{ path: 'userId', select: 'profile' }, { path: 'class', select: 'name' }] })
    .populate('issuedBy', 'profile')
    .populate('academicYearId', 'name startDate endDate')
    .lean();
}

async function issueCertificate(schoolId, body, userId) {
  const certNumber = await nextCertNumber(schoolId);
  const cert = await Certificate.create({
    schoolId, certNumber, ...body,
    issuedDate: body.issuedDate ? new Date(body.issuedDate) : new Date(),
    issuedBy: userId,
  });
  await createAuditLog({ schoolId, userId, action: 'CREATE', resource: 'Certificate', resourceId: cert._id, detail: `${body.type} — ${certNumber}` });
  return cert;
}

async function updateCertificate(schoolId, certId, body, userId) {
  const cert = await Certificate.findOneAndUpdate(
    { _id: certId, schoolId, isDeleted: false },
    { $set: body },
    { new: true, runValidators: true },
  );
  if (!cert) throw Object.assign(new Error('Certificate not found'), { status: 404 });
  await createAuditLog({ schoolId, userId, action: 'UPDATE', resource: 'Certificate', resourceId: cert._id });
  return cert;
}

async function deleteCertificate(schoolId, certId, userId) {
  const cert = await Certificate.findOneAndUpdate(
    { _id: certId, schoolId, isDeleted: false },
    { $set: { isDeleted: true, deletedAt: new Date() } },
    { new: true },
  );
  if (!cert) throw Object.assign(new Error('Certificate not found'), { status: 404 });
  await createAuditLog({ schoolId, userId, action: 'DELETE', resource: 'Certificate', resourceId: cert._id });
}

// ── Dashboard ────────────────────────────────────────────────────────────────

async function getDashboard(schoolId) {
  const sId  = new mongoose.Types.ObjectId(String(schoolId));
  const now  = new Date();
  const week = dayjs().add(7, 'day').toDate();

  const [evtStats, certStats, upcomingEvents, recentCerts] = await Promise.all([
    Event.aggregate([
      { $match: { schoolId: sId, isDeleted: false } },
      { $group: {
        _id: null,
        total:     { $sum: 1 },
        upcoming:  { $sum: { $cond: [{ $gte: ['$startDate', now] }, 1, 0] } },
        published: { $sum: { $cond: ['$isPublished', 1, 0] } },
        thisWeek:  { $sum: { $cond: [{ $and: [{ $gte: ['$startDate', now] }, { $lte: ['$startDate', week] }] }, 1, 0] } },
      }},
    ]),
    Certificate.aggregate([
      { $match: { schoolId: sId, isDeleted: false } },
      { $group: { _id: '$type', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]),
    Event.find({ schoolId, isDeleted: false, startDate: { $gte: now } })
      .sort({ startDate: 1 }).limit(5).lean(),
    Certificate.find({ schoolId, isDeleted: false })
      .sort({ issuedDate: -1 }).limit(5)
      .populate({ path: 'recipientId', select: 'rollNumber employeeId userId', populate: { path: 'userId', select: 'profile' } })
      .lean(),
  ]);

  return {
    ...(evtStats[0] || { total: 0, upcoming: 0, published: 0, thisWeek: 0 }),
    certByType: certStats,
    upcomingEvents,
    recentCerts,
  };
}

module.exports = {
  listEvents, getEvent, createEvent, updateEvent, deleteEvent,
  listCertificates, getCertificate, issueCertificate, updateCertificate, deleteCertificate,
  getDashboard,
};
