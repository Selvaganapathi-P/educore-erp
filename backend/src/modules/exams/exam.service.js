const mongoose = require('mongoose');
const Exam         = require('./exam.model');
const ExamSchedule = require('./examSchedule.model');
const ExamResult   = require('./examResult.model');

const GRADE_SCALE = [
  { min: 90, grade: 'A+', gp: 10 },
  { min: 80, grade: 'A',  gp: 9  },
  { min: 70, grade: 'B+', gp: 8  },
  { min: 60, grade: 'B',  gp: 7  },
  { min: 50, grade: 'C',  gp: 6  },
  { min: 40, grade: 'D',  gp: 5  },
  { min: 0,  grade: 'F',  gp: 0  },
];

function computeGrade(obtained, maxMarks) {
  if (!maxMarks) return { grade: 'N/A', gp: 0 };
  const pct = (obtained / maxMarks) * 100;
  const entry = GRADE_SCALE.find(g => pct >= g.min) ?? GRADE_SCALE[GRADE_SCALE.length - 1];
  return { grade: entry.grade, gp: entry.gp };
}

// ── Exam CRUD ─────────────────────────────────────────────────────────────────

async function createExam(schoolId, body) {
  return Exam.create({
    schoolId,
    academicYearId: body.academicYearId,
    name:        body.name,
    type:        body.type || 'mid_term',
    description: body.description || '',
    startDate:   new Date(body.startDate),
    endDate:     new Date(body.endDate),
  });
}

async function listExams(schoolId, query) {
  const filter = { schoolId, isDeleted: false };
  if (query.academicYearId) filter.academicYearId = query.academicYearId;
  if (query.type)   filter.type   = query.type;
  if (query.status) filter.status = query.status;

  return Exam.find(filter)
    .populate('academicYearId', 'name')
    .sort({ startDate: -1 });
}

async function getExam(schoolId, id) {
  const exam = await Exam.findOne({ _id: id, schoolId, isDeleted: false })
    .populate('academicYearId', 'name');
  if (!exam) throw Object.assign(new Error('Exam not found'), { status: 404 });

  const schedule = await ExamSchedule.find({ examId: id, schoolId, isDeleted: false })
    .populate('classId',   'name')
    .populate('subjectId', 'name color')
    .sort({ date: 1 });

  return { ...exam.toObject(), schedule };
}

async function updateExam(schoolId, id, body) {
  const exam = await Exam.findOne({ _id: id, schoolId, isDeleted: false });
  if (!exam) throw Object.assign(new Error('Not found'), { status: 404 });
  const allowed = ['name','type','description','startDate','endDate'];
  for (const k of allowed) {
    if (body[k] !== undefined) exam[k] = ['startDate','endDate'].includes(k) ? new Date(body[k]) : body[k];
  }
  return exam.save();
}

async function changeExamStatus(schoolId, id, status) {
  const exam = await Exam.findOne({ _id: id, schoolId, isDeleted: false });
  if (!exam) throw Object.assign(new Error('Not found'), { status: 404 });
  exam.status = status;
  if (status === 'published')         exam.publishedAt = new Date();
  if (status === 'completed')         exam.completedAt = new Date();
  if (status === 'results_published') exam.resultsPublishedAt = new Date();
  return exam.save();
}

async function deleteExam(schoolId, id) {
  const exam = await Exam.findOne({ _id: id, schoolId, isDeleted: false });
  if (!exam) throw Object.assign(new Error('Not found'), { status: 404 });
  exam.isDeleted = true;
  exam.deletedAt = new Date();
  return exam.save();
}

// ── Schedule ──────────────────────────────────────────────────────────────────

async function addSchedule(schoolId, examId, body) {
  const exam = await Exam.findOne({ _id: examId, schoolId, isDeleted: false });
  if (!exam) throw Object.assign(new Error('Exam not found'), { status: 404 });

  return ExamSchedule.create({
    schoolId,
    examId,
    classId:     body.classId,
    subjectId:   body.subjectId || undefined,
    subjectName: body.subjectName || '',
    date:        new Date(body.date),
    startTime:   body.startTime || '09:00',
    endTime:     body.endTime   || '11:00',
    maxMarks:    Number(body.maxMarks),
    passMark:    Number(body.passMark),
    roomNo:      body.roomNo || '',
  });
}

async function updateSchedule(schoolId, scheduleId, body) {
  const sch = await ExamSchedule.findOne({ _id: scheduleId, schoolId });
  if (!sch) throw Object.assign(new Error('Not found'), { status: 404 });
  const allowed = ['date','startTime','endTime','maxMarks','passMark','roomNo','subjectId','subjectName'];
  for (const k of allowed) if (body[k] !== undefined) sch[k] = k === 'date' ? new Date(body[k]) : body[k];
  return sch.save();
}

async function deleteSchedule(schoolId, scheduleId) {
  const sch = await ExamSchedule.findOne({ _id: scheduleId, schoolId });
  if (!sch) throw Object.assign(new Error('Not found'), { status: 404 });
  sch.isDeleted = true;
  return sch.save();
}

// ── Mark Entry ────────────────────────────────────────────────────────────────

async function enterMarks(schoolId, examId, scheduleId, body) {
  const sch = await ExamSchedule.findOne({ _id: scheduleId, examId, schoolId, isDeleted: false })
    .populate('subjectId', 'name');
  if (!sch) throw Object.assign(new Error('Schedule item not found'), { status: 404 });

  const exam = await Exam.findById(examId);
  const { sectionId, entries } = body;

  for (const e of entries) {
    const isAbsent    = e.isAbsent ?? false;
    const obtained    = isAbsent ? 0 : Math.min(Number(e.marksObtained) || 0, sch.maxMarks);
    const { grade, gp } = isAbsent ? { grade: 'AB', gp: 0 } : computeGrade(obtained, sch.maxMarks);
    const isPassed    = !isAbsent && obtained >= sch.passMark;

    const subjectResult = {
      scheduleId:    sch._id,
      subjectId:     sch.subjectId?._id ?? sch.subjectId,
      subjectName:   sch.subjectId?.name ?? sch.subjectName,
      marksObtained: obtained,
      maxMarks:      sch.maxMarks,
      passMark:      sch.passMark,
      grade,
      gradePoint:    gp,
      isPassed,
      isAbsent,
      remarks:       e.remarks || '',
    };

    // Upsert result doc
    const existUpdate = await ExamResult.updateOne(
      { examId, studentId: e.studentId, schoolId, 'subjectResults.scheduleId': sch._id },
      { $set: { 'subjectResults.$': subjectResult } }
    );

    if (existUpdate.matchedCount === 0) {
      await ExamResult.findOneAndUpdate(
        { examId, studentId: e.studentId, schoolId },
        {
          $setOnInsert: {
            userId: e.userId,
            classId: sch.classId,
            sectionId,
            academicYearId: exam?.academicYearId,
          },
          $push: { subjectResults: subjectResult },
        },
        { upsert: true }
      );
    }
  }

  return { marked: entries.length };
}

async function getMarksForSchedule(schoolId, examId, scheduleId, sectionId) {
  const results = await ExamResult.find({ schoolId, examId, sectionId: new mongoose.Types.ObjectId(sectionId) })
    .populate('studentId', 'rollNumber')
    .populate('userId',    'profile.firstName profile.lastName');

  return results.map(r => ({
    studentId:  r.studentId,
    userId:     r.userId,
    rollNumber: r.studentId?.rollNumber,
    ...( r.subjectResults.find(s => String(s.scheduleId) === String(scheduleId)) ?? {} ),
  }));
}

// ── Results ───────────────────────────────────────────────────────────────────

async function calculateResults(schoolId, examId, classId, sectionId) {
  const filter = { schoolId, examId };
  if (classId)   filter.classId   = classId;
  if (sectionId) filter.sectionId = new mongoose.Types.ObjectId(sectionId);

  const results = await ExamResult.find(filter);

  for (const r of results) {
    const total    = r.subjectResults.reduce((s, sr) => s + sr.maxMarks, 0);
    const obtained = r.subjectResults.reduce((s, sr) => s + sr.marksObtained, 0);
    const pct      = total ? Math.round((obtained / total) * 1000) / 10 : 0;
    const { grade, gp } = computeGrade(obtained, total);

    r.totalMarks    = total;
    r.totalObtained = obtained;
    r.percentage    = pct;
    r.grade         = grade;
    r.gradePoint    = gp;
    r.isPassed      = r.subjectResults.every(sr => sr.isAbsent || sr.isPassed);
    await r.save();
  }

  // Assign ranks (within section)
  const sorted = [...results].sort((a, b) => b.totalObtained - a.totalObtained);
  let rank = 1;
  for (let i = 0; i < sorted.length; i++) {
    if (i > 0 && sorted[i].totalObtained < sorted[i - 1].totalObtained) rank = i + 1;
    sorted[i].rank = rank;
    await sorted[i].save();
  }

  return { processed: results.length };
}

async function getClassResults(schoolId, examId, classId, sectionId) {
  const filter = { schoolId, examId };
  if (classId)   filter.classId   = classId;
  if (sectionId) filter.sectionId = new mongoose.Types.ObjectId(sectionId);

  return ExamResult.find(filter)
    .populate('studentId', 'rollNumber')
    .populate('userId',    'profile.firstName profile.lastName profile.photo')
    .populate('subjectResults.subjectId', 'name')
    .sort({ rank: 1, totalObtained: -1 });
}

async function getStudentResult(schoolId, studentId, examId) {
  const result = await ExamResult.findOne({ schoolId, studentId, examId })
    .populate('examId',    'name type startDate endDate')
    .populate('studentId', 'rollNumber')
    .populate('userId',    'profile.firstName profile.lastName profile.photo profile.dob')
    .populate('classId',   'name')
    .populate('subjectResults.subjectId', 'name');
  if (!result) throw Object.assign(new Error('Result not found'), { status: 404 });
  return result;
}

async function publishResults(schoolId, examId, classId, sectionId) {
  const filter = { schoolId, examId };
  if (classId)   filter.classId   = classId;
  if (sectionId) filter.sectionId = new mongoose.Types.ObjectId(sectionId);
  await ExamResult.updateMany(filter, { $set: { isPublished: true, publishedAt: new Date() } });
  await changeExamStatus(schoolId, examId, 'results_published');
  return { published: true };
}

async function getStudentsForExam(schoolId, classId, sectionId) {
  const Student = require('../students/student.model');
  return Student.find({ schoolId, currentClass: classId, currentSection: new mongoose.Types.ObjectId(sectionId), isDeleted: false })
    .populate('userId', 'profile.firstName profile.lastName')
    .select('userId rollNumber')
    .sort({ rollNumber: 1 });
}

module.exports = {
  createExam, listExams, getExam, updateExam, changeExamStatus, deleteExam,
  addSchedule, updateSchedule, deleteSchedule,
  enterMarks, getMarksForSchedule,
  calculateResults, getClassResults, getStudentResult, publishResults,
  getStudentsForExam,
};
