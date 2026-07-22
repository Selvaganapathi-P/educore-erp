const mongoose = require('mongoose');
const dayjs = require('dayjs');
const HealthRecord  = require('./healthRecord.model');
const MedicalVisit  = require('./medicalVisit.model');
const { createAuditLog } = require('../../utils/auditLog');

// ── Health Records ────────────────────────────────────────────────────────────

async function upsertRecord(schoolId, body, userId) {
  const { memberId, memberModel, ...rest } = body;
  const record = await HealthRecord.findOneAndUpdate(
    { schoolId, memberId, memberModel },
    { $set: { schoolId, memberId, memberModel, ...rest } },
    { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true },
  );
  await createAuditLog({ schoolId, userId, action: 'UPSERT', resource: 'HealthRecord', resourceId: record._id });
  return record;
}

async function getRecord(schoolId, memberId, memberModel) {
  return HealthRecord.findOne({ schoolId, memberId, memberModel, isDeleted: false }).lean();
}

async function listRecords(schoolId, { memberModel, page = 1, limit = 20 } = {}) {
  const filter = { schoolId, isDeleted: false };
  if (memberModel) filter.memberModel = memberModel;
  const [data, total] = await Promise.all([
    HealthRecord.find(filter)
      .sort({ updatedAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate({ path: 'memberId', select: 'rollNumber employeeId userId', populate: { path: 'userId', select: 'profile' } })
      .lean(),
    HealthRecord.countDocuments(filter),
  ]);
  return { data, total, page: Number(page), pages: Math.ceil(total / limit) };
}

// ── Medical Visits ────────────────────────────────────────────────────────────

async function createVisit(schoolId, body, userId) {
  const visit = await MedicalVisit.create({
    schoolId,
    ...body,
    visitDate:    body.visitDate    ? new Date(body.visitDate)    : new Date(),
    followUpDate: body.followUpDate ? new Date(body.followUpDate) : undefined,
    attendedBy:   userId,
  });
  await createAuditLog({ schoolId, userId, action: 'CREATE', resource: 'MedicalVisit', resourceId: visit._id, detail: body.complaint });
  return visit;
}

async function updateVisit(schoolId, visitId, body, userId) {
  const visit = await MedicalVisit.findOneAndUpdate(
    { _id: visitId, schoolId, isDeleted: false },
    { $set: body },
    { new: true, runValidators: true },
  );
  if (!visit) throw Object.assign(new Error('Visit not found'), { status: 404 });
  await createAuditLog({ schoolId, userId, action: 'UPDATE', resource: 'MedicalVisit', resourceId: visit._id });
  return visit;
}

async function deleteVisit(schoolId, visitId, userId) {
  const visit = await MedicalVisit.findOneAndUpdate(
    { _id: visitId, schoolId, isDeleted: false },
    { $set: { isDeleted: true, deletedAt: new Date() } },
    { new: true },
  );
  if (!visit) throw Object.assign(new Error('Visit not found'), { status: 404 });
  await createAuditLog({ schoolId, userId, action: 'DELETE', resource: 'MedicalVisit', resourceId: visit._id });
}

async function listVisits(schoolId, { memberId, memberModel, from, to, page = 1, limit = 30 } = {}) {
  const filter = { schoolId, isDeleted: false };
  if (memberId)    filter.memberId    = memberId;
  if (memberModel) filter.memberModel = memberModel;
  if (from || to) {
    filter.visitDate = {};
    if (from) filter.visitDate.$gte = new Date(from);
    if (to)   filter.visitDate.$lte = dayjs(to).endOf('day').toDate();
  }
  const [data, total] = await Promise.all([
    MedicalVisit.find(filter)
      .sort({ visitDate: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate({ path: 'memberId', select: 'rollNumber employeeId userId', populate: { path: 'userId', select: 'profile' } })
      .populate('attendedBy', 'profile')
      .lean(),
    MedicalVisit.countDocuments(filter),
  ]);
  return { data, total, page: Number(page), pages: Math.ceil(total / limit) };
}

async function getVisit(schoolId, visitId) {
  return MedicalVisit.findOne({ _id: visitId, schoolId, isDeleted: false })
    .populate({ path: 'memberId', select: 'rollNumber employeeId userId', populate: { path: 'userId', select: 'profile' } })
    .populate('attendedBy', 'profile')
    .lean();
}

// ── Dashboard ────────────────────────────────────────────────────────────────

async function getDashboard(schoolId) {
  const sId  = new mongoose.Types.ObjectId(String(schoolId));
  const today = dayjs().startOf('day').toDate();
  const week  = dayjs().subtract(7, 'day').toDate();

  const [summary, bloodGroups, recentVisits, followUps] = await Promise.all([
    MedicalVisit.aggregate([
      { $match: { schoolId: sId, isDeleted: false } },
      { $group: {
        _id: null,
        totalVisits: { $sum: 1 },
        todayVisits: { $sum: { $cond: [{ $gte: ['$visitDate', today] }, 1, 0] } },
        weekVisits:  { $sum: { $cond: [{ $gte: ['$visitDate', week]  }, 1, 0] } },
      }},
    ]),
    HealthRecord.aggregate([
      { $match: { schoolId: sId, isDeleted: false } },
      { $group: { _id: '$bloodGroup', count: { $sum: 1 } } },
      { $sort:  { count: -1 } },
    ]),
    MedicalVisit.find({ schoolId, isDeleted: false })
      .sort({ visitDate: -1 })
      .limit(8)
      .populate({ path: 'memberId', select: 'rollNumber employeeId userId', populate: { path: 'userId', select: 'profile' } })
      .lean(),
    MedicalVisit.find({ schoolId, isDeleted: false, followUpDate: { $gte: today } })
      .sort({ followUpDate: 1 })
      .limit(5)
      .populate({ path: 'memberId', select: 'rollNumber employeeId userId', populate: { path: 'userId', select: 'profile' } })
      .lean(),
  ]);

  return {
    ...(summary[0] || { totalVisits: 0, todayVisits: 0, weekVisits: 0 }),
    bloodGroups,
    recentVisits,
    followUps,
  };
}

module.exports = { upsertRecord, getRecord, listRecords, createVisit, updateVisit, deleteVisit, listVisits, getVisit, getDashboard };
