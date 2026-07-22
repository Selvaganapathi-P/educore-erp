const { Admission, ADMISSION_STATUSES } = require('./admission.model');
const { User } = require('../users/user.model');
const { NotFoundError, ForbiddenError, ValidationError } = require('../../utils/appError');
const { paginate } = require('../../utils/apiResponse');

// Valid forward transitions per status
const TRANSITIONS = {
  enquiry:              ['applied','rejected'],
  applied:              ['documents_pending','under_review','rejected'],
  documents_pending:    ['under_review','rejected'],
  under_review:         ['interview_scheduled','approved','waitlisted','rejected'],
  interview_scheduled:  ['approved','waitlisted','rejected'],
  approved:             ['enrolled','rejected'],
  waitlisted:           ['approved','rejected'],
  enrolled:             [],
  rejected:             [],
};

async function create(data, schoolId, creatorId) {
  const admission = await Admission.create({
    ...data,
    schoolId,
    status: 'enquiry',
    statusHistory: [{ status: 'enquiry', changedBy: creatorId }],
  });
  return admission;
}

async function list(query, schoolId) {
  const { page, limit, search, status, class: cls, year, source, sortBy, sortOrder } = query;
  const filter = { schoolId, isDeleted: false };
  if (status) filter.status = status;
  if (cls)    filter.applyingForClass = { $regex: cls, $options: 'i' };
  if (year)   filter.applyingForYear = year;
  if (source) filter.source = source;
  if (search) {
    filter.$or = [
      { applicationNo:        { $regex: search, $options: 'i' } },
      { 'student.firstName':  { $regex: search, $options: 'i' } },
      { 'student.lastName':   { $regex: search, $options: 'i' } },
      { 'father.phone':       { $regex: search, $options: 'i' } },
      { 'mother.phone':       { $regex: search, $options: 'i' } },
      { 'father.email':       { $regex: search, $options: 'i' } },
    ];
  }

  const sort  = { [sortBy]: sortOrder === 'asc' ? 1 : -1 };
  const skip  = (page - 1) * limit;
  const total = await Admission.countDocuments(filter);
  const data  = await Admission.find(filter)
    .sort(sort).skip(skip).limit(limit)
    .select('-__v -aadhaarNo')
    .populate('reviewedBy approvedBy', 'profile.firstName profile.lastName');

  return { data, meta: paginate(page, limit, total) };
}

async function findById(id, schoolId) {
  const admission = await Admission.findOne({ _id: id, schoolId, isDeleted: false })
    .populate('statusHistory.changedBy', 'profile.firstName profile.lastName')
    .populate('reviewedBy approvedBy enrolledStudentId', 'profile.firstName profile.lastName email');
  if (!admission) throw new NotFoundError('Admission not found');
  return admission;
}

async function update(id, data, schoolId) {
  const admission = await findById(id, schoolId);
  if (['enrolled','rejected'].includes(admission.status)) {
    throw new ForbiddenError(`Cannot edit a ${admission.status} application`);
  }
  Object.assign(admission, data);
  await admission.save();
  return admission;
}

async function updateStatus(id, schoolId, { status, note, interviewDate, rejectionReason, waitlistPosition }, actorId) {
  const admission = await findById(id, schoolId);
  const allowed   = TRANSITIONS[admission.status] ?? [];

  if (!allowed.includes(status)) {
    throw new ValidationError(`Cannot transition from '${admission.status}' to '${status}'`);
  }

  admission.status = status;
  admission.statusHistory.push({ status, changedBy: actorId, note });

  if (status === 'interview_scheduled' && interviewDate) admission.interviewDate = new Date(interviewDate);
  if (status === 'rejected' && rejectionReason)           admission.rejectionReason = rejectionReason;
  if (status === 'waitlisted' && waitlistPosition)        admission.waitlistPosition = waitlistPosition;
  if (status === 'approved') { admission.approvedBy = actorId; admission.approvedAt = new Date(); }
  if (status === 'under_review') { admission.reviewedBy = actorId; admission.reviewedAt = new Date(); admission.reviewNote = note; }

  await admission.save();
  return admission;
}

async function enroll(id, schoolId, actorId) {
  const admission = await findById(id, schoolId);
  if (admission.status !== 'approved') {
    throw new ForbiddenError('Only approved applications can be enrolled');
  }
  if (admission.enrolledStudentId) {
    throw new ForbiddenError('Already enrolled');
  }

  // Create student user
  const student = await User.create({
    schoolId,
    email:    admission.father?.email || admission.mother?.email || admission.guardian?.email ||
              `student.${admission.applicationNo.toLowerCase().replace('-','.')}@school.local`,
    password: `Edu@${Math.random().toString(36).slice(-8)}`,
    role:     'student',
    status:   'active',
    isEmailVerified: true,
    profile: {
      firstName:   admission.student.firstName,
      lastName:    admission.student.lastName,
      dateOfBirth: admission.student.dateOfBirth,
      gender:      admission.student.gender,
      bloodGroup:  admission.student.bloodGroup,
      phone:       admission.father?.phone || admission.mother?.phone || '',
    },
  });

  admission.status             = 'enrolled';
  admission.enrolledStudentId  = student._id;
  admission.enrolledAt         = new Date();
  admission.statusHistory.push({ status: 'enrolled', changedBy: actorId, note: 'Auto-enrolled on approval' });
  await admission.save();

  return { admission, student };
}

async function softDelete(id, schoolId) {
  const admission = await findById(id, schoolId);
  admission.isDeleted = true;
  admission.deletedAt = new Date();
  await admission.save();
}

async function getPipelineStats(schoolId) {
  const counts = await Admission.aggregate([
    { $match: { schoolId: require('mongoose').Types.ObjectId.createFromHexString(schoolId.toString()), isDeleted: false } },
    { $group: { _id: '$status', count: { $sum: 1 } } },
  ]);
  const map = Object.fromEntries(ADMISSION_STATUSES.map(s => [s, 0]));
  counts.forEach(c => { map[c._id] = c.count; });
  return map;
}

module.exports = { create, list, findById, update, updateStatus, enroll, softDelete, getPipelineStats, ADMISSION_STATUSES };
