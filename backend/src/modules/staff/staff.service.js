const { StaffProfile } = require('./staff.model');
const { User } = require('../users/user.model');
const { NotFoundError, ConflictError } = require('../../utils/appError');
const { paginate } = require('../../utils/apiResponse');

const STAFF_ROLES = ['school_admin','principal','vice_principal','teacher','hr','receptionist',
  'accountant','librarian','transport_manager','hostel_warden','store_manager',
  'nurse','counselor','security_guard','it_administrator'];

async function create(data, schoolId) {
  const user = await User.findOne({ _id: data.userId, schoolId, isDeleted: false });
  if (!user) throw new NotFoundError('User not found in this school');
  if (!STAFF_ROLES.includes(user.role)) throw new ConflictError('User must have a staff role');

  const existing = await StaffProfile.findOne({ userId: data.userId });
  if (existing) throw new ConflictError('Staff profile already exists for this user');

  return StaffProfile.create({ ...data, schoolId });
}

async function list(query, schoolId) {
  const { page, limit, search, department, employmentType, status, sortBy, sortOrder } = query;
  const filter = { schoolId, isDeleted: false };
  if (department)     filter.department     = { $regex: department, $options: 'i' };
  if (employmentType) filter.employmentType = employmentType;
  if (status)         filter.status         = status;

  const sort = { [sortBy]: sortOrder === 'asc' ? 1 : -1 };
  const skip = (page - 1) * limit;

  let pipeline = [
    { $match: filter },
    { $lookup: { from: 'users', localField: 'userId', foreignField: '_id', as: 'user' } },
    { $unwind: { path: '$user', preserveNullAndEmpty: false } },
  ];

  if (search) {
    pipeline.push({ $match: {
      $or: [
        { employeeId: { $regex: search, $options: 'i' } },
        { department:  { $regex: search, $options: 'i' } },
        { designation: { $regex: search, $options: 'i' } },
        { 'user.email':             { $regex: search, $options: 'i' } },
        { 'user.profile.firstName': { $regex: search, $options: 'i' } },
        { 'user.profile.lastName':  { $regex: search, $options: 'i' } },
      ],
    }});
  }

  const [countResult, data] = await Promise.all([
    StaffProfile.aggregate([...pipeline, { $count: 'total' }]),
    StaffProfile.aggregate([
      ...pipeline,
      { $sort: sort },
      { $skip: skip },
      { $limit: limit },
      { $project: {
        employeeId: 1, department: 1, designation: 1, employmentType: 1,
        joiningDate: 1, status: 1, subjects: 1, classes: 1, createdAt: 1,
        'user._id': 1, 'user.email': 1, 'user.profile': 1, 'user.role': 1, 'user.status': 1,
      }},
    ]),
  ]);

  const total = countResult[0]?.total ?? 0;
  return { data, meta: paginate(page, limit, total) };
}

async function findById(id, schoolId) {
  const profile = await StaffProfile.findOne({ _id: id, schoolId, isDeleted: false })
    .populate('userId', '-password -refreshTokens -salary')
    .populate('reportingTo', 'profile.firstName profile.lastName');
  if (!profile) throw new NotFoundError('Staff profile not found');
  return profile;
}

async function findByUserId(userId, schoolId) {
  const profile = await StaffProfile.findOne({ userId, schoolId, isDeleted: false })
    .populate('userId', '-password -refreshTokens');
  if (!profile) throw new NotFoundError('Staff profile not found');
  return profile;
}

async function update(id, data, schoolId) {
  const profile = await findById(id, schoolId);

  const mergeable = ['emergencyContact','leaveBalance','salary'];
  for (const key of mergeable) {
    if (data[key]) {
      const cur = profile[key]?.toObject ? profile[key].toObject() : (profile[key] ?? {});
      profile[key] = { ...cur, ...data[key] };
      profile.markModified(key);
    }
  }

  if (data.qualifications !== undefined) { profile.qualifications = data.qualifications; profile.markModified('qualifications'); }
  if (data.experience !== undefined)     { profile.experience = data.experience; profile.markModified('experience'); }

  const scalar = ['department','designation','employmentType','reportingTo','joiningDate',
    'confirmationDate','subjects','classes','biometricId','rfidCard','status',
    'relievingDate','relievingReason','noticePeriodEnd'];
  for (const key of scalar) {
    if (data[key] !== undefined) profile[key] = data[key];
  }

  await profile.save();
  return profile;
}

async function softDelete(id, schoolId) {
  const profile = await findById(id, schoolId);
  profile.isDeleted = true;
  profile.deletedAt = new Date();
  await profile.save();
}

async function getDepartmentStats(schoolId) {
  const mongoose = require('mongoose');
  const oid = mongoose.Types.ObjectId.createFromHexString(schoolId.toString());
  const [byDept, byType, byStatus, total] = await Promise.all([
    StaffProfile.aggregate([
      { $match: { schoolId: oid, isDeleted: false } },
      { $group: { _id: '$department', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]),
    StaffProfile.aggregate([
      { $match: { schoolId: oid, isDeleted: false } },
      { $group: { _id: '$employmentType', count: { $sum: 1 } } },
    ]),
    StaffProfile.aggregate([
      { $match: { schoolId: oid, isDeleted: false } },
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]),
    StaffProfile.countDocuments({ schoolId, isDeleted: false }),
  ]);
  return { total, byDept, byType, byStatus };
}

module.exports = { create, list, findById, findByUserId, update, softDelete, getDepartmentStats };
