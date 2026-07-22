const { StudentProfile } = require('./student.model');
const { User } = require('../users/user.model');
const { NotFoundError, ConflictError } = require('../../utils/appError');
const { paginate } = require('../../utils/apiResponse');

async function create(data, schoolId) {
  const user = await User.findOne({ _id: data.userId, schoolId, isDeleted: false });
  if (!user) throw new NotFoundError('User not found in this school');
  if (user.role !== 'student') throw new ConflictError('User must have the student role');

  const existing = await StudentProfile.findOne({ userId: data.userId });
  if (existing) throw new ConflictError('Student profile already exists for this user');

  return StudentProfile.create({ ...data, schoolId });
}

async function list(query, schoolId) {
  const { page, limit, search, class: cls, section, academicYear, status, sortBy, sortOrder } = query;
  const filter = { schoolId, isDeleted: false };
  if (cls)          filter.class        = { $regex: cls,     $options: 'i' };
  if (section)      filter.section      = { $regex: section, $options: 'i' };
  if (academicYear) filter.academicYear = academicYear;
  if (status)       filter.status       = status;

  // Search joins to user — use aggregate for name/email search
  const sort  = { [sortBy]: sortOrder === 'asc' ? 1 : -1 };
  const skip  = (page - 1) * limit;

  let pipeline = [
    { $match: filter },
    { $lookup: { from: 'users', localField: 'userId', foreignField: '_id', as: 'user' } },
    { $unwind: { path: '$user', preserveNullAndEmpty: false } },
  ];

  if (search) {
    pipeline.push({ $match: {
      $or: [
        { rollNumber: { $regex: search, $options: 'i' } },
        { 'user.email': { $regex: search, $options: 'i' } },
        { 'user.profile.firstName': { $regex: search, $options: 'i' } },
        { 'user.profile.lastName':  { $regex: search, $options: 'i' } },
        { 'user.profile.phone':     { $regex: search, $options: 'i' } },
      ],
    }});
  }

  const [countResult, data] = await Promise.all([
    StudentProfile.aggregate([...pipeline, { $count: 'total' }]),
    StudentProfile.aggregate([
      ...pipeline,
      { $sort: sort },
      { $skip: skip },
      { $limit: limit },
      { $project: {
        rollNumber: 1, class: 1, section: 1, academicYear: 1, status: 1,
        feeCategory: 1, transport: 1, hostel: 1, createdAt: 1,
        'user._id': 1, 'user.email': 1, 'user.profile': 1, 'user.status': 1,
      }},
    ]),
  ]);

  const total = countResult[0]?.total ?? 0;
  return { data, meta: paginate(page, limit, total) };
}

async function findById(id, schoolId) {
  const profile = await StudentProfile.findOne({ _id: id, schoolId, isDeleted: false })
    .populate('userId', '-password -refreshTokens')
    .populate('admissionId', 'applicationNo applyingForClass');
  if (!profile) throw new NotFoundError('Student profile not found');
  return profile;
}

async function findByUserId(userId, schoolId) {
  const profile = await StudentProfile.findOne({ userId, schoolId, isDeleted: false })
    .populate('userId', '-password -refreshTokens');
  if (!profile) throw new NotFoundError('Student profile not found');
  return profile;
}

async function update(id, data, schoolId) {
  const profile = await findById(id, schoolId);
  const mergeable = ['medical','transport','hostel','extracurricular'];
  for (const key of mergeable) {
    if (data[key]) {
      const cur = profile[key]?.toObject ? profile[key].toObject() : (profile[key] ?? {});
      profile[key] = { ...cur, ...data[key] };
      profile.markModified(key);
    }
  }
  const scalar = ['class','section','academicYear','house','feeCategory','status','leftOn','leftReason','transferredTo','tcIssued','tcDate','tcNumber','biometricId','rfidCard'];
  for (const key of scalar) {
    if (data[key] !== undefined) profile[key] = data[key];
  }
  await profile.save();
  return profile;
}

async function addAchievement(id, schoolId, achievement) {
  const profile = await findById(id, schoolId);
  profile.achievements.push(achievement);
  await profile.save();
  return profile;
}

async function softDelete(id, schoolId) {
  const profile = await findById(id, schoolId);
  profile.isDeleted = true;
  profile.deletedAt = new Date();
  await profile.save();
}

async function getStats(schoolId) {
  const [total, byClass, byStatus] = await Promise.all([
    StudentProfile.countDocuments({ schoolId, isDeleted: false }),
    StudentProfile.aggregate([
      { $match: { schoolId: require('mongoose').Types.ObjectId.createFromHexString(schoolId.toString()), isDeleted: false } },
      { $group: { _id: '$class', count: { $sum: 1 } } },
      { $sort: { _id: 1 } },
    ]),
    StudentProfile.aggregate([
      { $match: { schoolId: require('mongoose').Types.ObjectId.createFromHexString(schoolId.toString()), isDeleted: false } },
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]),
  ]);
  return { total, byClass, byStatus };
}

module.exports = { create, list, findById, findByUserId, update, addAchievement, softDelete, getStats };
