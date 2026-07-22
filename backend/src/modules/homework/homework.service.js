const dayjs = require('dayjs');
const Homework   = require('./homework.model');
const Submission = require('./submission.model');

const ADMIN_ROLES = ['super_admin','school_admin','principal','vice_principal'];

async function createHomework(schoolId, body, userId) {
  const Staff = require('../staff/staff.model');
  const staff = await Staff.findOne({ schoolId, userId, isDeleted: false }).select('_id');

  return Homework.create({
    schoolId,
    academicYearId: body.academicYearId,
    classId:    body.classId,
    sectionId:  body.sectionId || undefined,
    subjectId:  body.subjectId || undefined,
    teacherUserId: userId,
    teacherId:  staff?._id,
    title:       body.title,
    description: body.description || '',
    instructions:body.instructions || '',
    dueDate:     new Date(body.dueDate),
    type:        body.type || 'homework',
    maxMarks:    body.maxMarks ?? 10,
    allowLateSubmission: body.allowLateSubmission ?? true,
    latePenaltyPct: body.latePenaltyPct || 0,
    status: 'draft',
  });
}

async function listHomework(schoolId, query, userId, userRole) {
  const filter = { schoolId, isDeleted: false };

  if (query.classId)   filter.classId   = query.classId;
  if (query.sectionId) filter.sectionId = query.sectionId;
  if (query.subjectId) filter.subjectId = query.subjectId;
  if (query.status)    filter.status    = query.status;
  if (query.type)      filter.type      = query.type;

  if (!ADMIN_ROLES.includes(userRole)) {
    filter.teacherUserId = userId;
  }

  if (query.fromDate || query.toDate) {
    filter.dueDate = {};
    if (query.fromDate) filter.dueDate.$gte = dayjs(query.fromDate).toDate();
    if (query.toDate)   filter.dueDate.$lte = dayjs(query.toDate).endOf('day').toDate();
  }

  const page  = Math.max(Number(query.page) || 1, 1);
  const limit = Math.min(Number(query.limit) || 20, 100);

  const [data, total] = await Promise.all([
    Homework.find(filter)
      .populate('classId',       'name')
      .populate('subjectId',     'name color')
      .populate('teacherUserId', 'profile.firstName profile.lastName')
      .sort({ dueDate: -1 })
      .skip((page - 1) * limit)
      .limit(limit),
    Homework.countDocuments(filter),
  ]);

  // Attach quick submission counts
  const hwIds = data.map(h => h._id);
  const submCounts = await Submission.aggregate([
    { $match: { homeworkId: { $in: hwIds } } },
    { $group: { _id: '$homeworkId', submitted: { $sum: 1 }, graded: { $sum: { $cond: [{ $eq: ['$status','graded'] }, 1, 0] } } } },
  ]);
  const countMap = Object.fromEntries(submCounts.map(c => [String(c._id), c]));

  const enriched = data.map(h => ({
    ...h.toObject(),
    _submissionCount: countMap[String(h._id)] ?? { submitted: 0, graded: 0 },
  }));

  return { data: enriched, total, page, pages: Math.ceil(total / limit) };
}

async function listStudentHomework(schoolId, userId, query) {
  const Student = require('../students/student.model');
  const student = await Student.findOne({ schoolId, userId, isDeleted: false });
  if (!student) throw Object.assign(new Error('Student profile not found'), { status: 404 });

  const filter = {
    schoolId,
    classId: student.currentClass,
    isDeleted: false,
    status: 'published',
    $or: [
      { sectionId: student.currentSection },
      { sectionId: { $exists: false } },
      { sectionId: null },
    ],
  };
  if (query.subjectId) filter.subjectId = query.subjectId;

  const homework = await Homework.find(filter)
    .populate('subjectId', 'name color')
    .populate('classId',   'name')
    .sort({ dueDate: 1 });

  const hwIds = homework.map(h => h._id);
  const submissions = await Submission.find({ homeworkId: { $in: hwIds }, studentId: student._id })
    .select('homeworkId status grade finalGrade feedback submittedAt');

  const subMap = Object.fromEntries(submissions.map(s => [String(s.homeworkId), s]));

  return homework.map(h => ({
    ...h.toObject(),
    submission: subMap[String(h._id)] ?? null,
    isOverdue:  new Date() > h.dueDate && !subMap[String(h._id)],
  }));
}

async function getHomework(schoolId, id) {
  const hw = await Homework.findOne({ _id: id, schoolId, isDeleted: false })
    .populate('classId',       'name')
    .populate('subjectId',     'name color')
    .populate('teacherUserId', 'profile.firstName profile.lastName');
  if (!hw) throw Object.assign(new Error('Homework not found'), { status: 404 });
  return hw;
}

async function updateHomework(schoolId, id, body) {
  const hw = await Homework.findOne({ _id: id, schoolId, isDeleted: false });
  if (!hw) throw Object.assign(new Error('Not found'), { status: 404 });
  if (hw.status === 'closed') throw Object.assign(new Error('Cannot edit a closed homework'), { status: 400 });

  const allowed = ['title','description','instructions','dueDate','type','maxMarks','allowLateSubmission','latePenaltyPct','sectionId','subjectId'];
  for (const k of allowed) if (body[k] !== undefined) hw[k] = k === 'dueDate' ? new Date(body[k]) : body[k];

  return hw.save();
}

async function changeStatus(schoolId, id, status) {
  const hw = await Homework.findOne({ _id: id, schoolId, isDeleted: false });
  if (!hw) throw Object.assign(new Error('Not found'), { status: 404 });

  hw.status = status;
  if (status === 'published' && !hw.publishedAt) hw.publishedAt = new Date();
  if (status === 'closed')    hw.closedAt = new Date();

  return hw.save();
}

async function deleteHomework(schoolId, id) {
  const hw = await Homework.findOne({ _id: id, schoolId, isDeleted: false });
  if (!hw) throw Object.assign(new Error('Not found'), { status: 404 });
  hw.isDeleted = true;
  hw.deletedAt = new Date();
  return hw.save();
}

async function getSubmissions(schoolId, homeworkId) {
  return Submission.find({ homeworkId, schoolId })
    .populate('studentId', 'rollNumber')
    .populate('userId',    'profile.firstName profile.lastName')
    .populate('gradedBy',  'profile.firstName profile.lastName')
    .sort({ submittedAt: 1 });
}

async function submitHomework(schoolId, homeworkId, body, userId) {
  const Student = require('../students/student.model');
  const hw = await Homework.findOne({ _id: homeworkId, schoolId, isDeleted: false });
  if (!hw) throw Object.assign(new Error('Homework not found'), { status: 404 });
  if (hw.status === 'closed') throw Object.assign(new Error('Homework is closed for submissions'), { status: 400 });

  const student = await Student.findOne({ schoolId, userId, isDeleted: false });
  if (!student) throw Object.assign(new Error('Student profile not found'), { status: 404 });

  const isLate = new Date() > new Date(hw.dueDate);
  if (isLate && !hw.allowLateSubmission) throw Object.assign(new Error('Late submissions are not allowed'), { status: 400 });

  return Submission.findOneAndUpdate(
    { homeworkId, studentId: student._id },
    {
      $set: {
        schoolId,
        userId,
        submittedAt: new Date(),
        status:      isLate ? 'late' : 'submitted',
        content:     body.content || '',
        attachments: body.attachments || [],
        isLate,
      },
    },
    { upsert: true, new: true }
  );
}

async function gradeSubmission(schoolId, submissionId, body, userId) {
  const sub = await Submission.findOne({ _id: submissionId, schoolId });
  if (!sub) throw Object.assign(new Error('Submission not found'), { status: 404 });

  const hw      = await Homework.findById(sub.homeworkId);
  const grade   = Math.min(Number(body.grade), hw?.maxMarks ?? Infinity);
  const penalty = sub.isLate ? (hw?.latePenaltyPct || 0) : 0;
  const final   = Math.max(0, Math.round(grade * (1 - penalty / 100) * 10) / 10);

  sub.grade          = grade;
  sub.finalGrade     = final;
  sub.penaltyApplied = penalty;
  sub.feedback       = body.feedback || '';
  sub.gradedBy       = userId;
  sub.gradedAt       = new Date();
  sub.status         = 'graded';

  return sub.save();
}

async function getStats(schoolId, homeworkId) {
  const [submitted, graded, avgResult] = await Promise.all([
    Submission.countDocuments({ homeworkId, schoolId, status: { $in: ['submitted','late','graded','returned'] } }),
    Submission.countDocuments({ homeworkId, schoolId, status: 'graded' }),
    Submission.aggregate([
      { $match: { homeworkId: new (require('mongoose').Types.ObjectId)(homeworkId), schoolId: new (require('mongoose').Types.ObjectId)(schoolId), status: 'graded' } },
      { $group: { _id: null, avg: { $avg: '$finalGrade' } } },
    ]),
  ]);
  return { submitted, graded, avgGrade: avgResult[0]?.avg ?? null };
}

module.exports = { createHomework, listHomework, listStudentHomework, getHomework, updateHomework, changeStatus, deleteHomework, getSubmissions, submitHomework, gradeSubmission, getStats };
