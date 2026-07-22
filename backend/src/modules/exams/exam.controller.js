const svc = require('./exam.service');
const { asyncHandler }   = require('../../utils/asyncHandler');
const { createAuditLog } = require('../../utils/auditLog');

const h = asyncHandler;

// ── Exams ─────────────────────────────────────────────────────────────────────
const create = h(async (req, res) => {
  const data = await svc.createExam(req.schoolId, req.body);
  await createAuditLog({ schoolId: req.schoolId, userId: req.user._id, action: 'EXAM_CREATED', entity: 'Exam', entityId: data._id, details: data.name });
  res.status(201).json({ success: true, data });
});

const list = h(async (req, res) => {
  const data = await svc.listExams(req.schoolId, req.query);
  res.json({ success: true, data });
});

const getOne = h(async (req, res) => {
  const data = await svc.getExam(req.schoolId, req.params.id);
  res.json({ success: true, data });
});

const update = h(async (req, res) => {
  const data = await svc.updateExam(req.schoolId, req.params.id, req.body);
  res.json({ success: true, data });
});

const publish = h(async (req, res) => {
  const data = await svc.changeExamStatus(req.schoolId, req.params.id, 'published');
  res.json({ success: true, data });
});

const complete = h(async (req, res) => {
  const data = await svc.changeExamStatus(req.schoolId, req.params.id, 'completed');
  res.json({ success: true, data });
});

const remove = h(async (req, res) => {
  await svc.deleteExam(req.schoolId, req.params.id);
  res.json({ success: true, message: 'Deleted' });
});

// ── Schedule ──────────────────────────────────────────────────────────────────
const addSchedule = h(async (req, res) => {
  const data = await svc.addSchedule(req.schoolId, req.params.id, req.body);
  res.status(201).json({ success: true, data });
});

const updateSchedule = h(async (req, res) => {
  const data = await svc.updateSchedule(req.schoolId, req.params.sid, req.body);
  res.json({ success: true, data });
});

const deleteSchedule = h(async (req, res) => {
  await svc.deleteSchedule(req.schoolId, req.params.sid);
  res.json({ success: true, message: 'Removed' });
});

// ── Marks ─────────────────────────────────────────────────────────────────────
const enterMarks = h(async (req, res) => {
  const data = await svc.enterMarks(req.schoolId, req.params.id, req.params.sid, req.body);
  await createAuditLog({ schoolId: req.schoolId, userId: req.user._id, action: 'MARKS_ENTERED', entity: 'ExamResult', details: `${data.marked} entries` });
  res.json({ success: true, data });
});

const getMarks = h(async (req, res) => {
  const { sectionId } = req.query;
  const data = await svc.getMarksForSchedule(req.schoolId, req.params.id, req.params.sid, sectionId);
  res.json({ success: true, data });
});

const studentsForExam = h(async (req, res) => {
  const { classId, sectionId } = req.query;
  const data = await svc.getStudentsForExam(req.schoolId, classId, sectionId);
  res.json({ success: true, data });
});

// ── Results ───────────────────────────────────────────────────────────────────
const calculate = h(async (req, res) => {
  const { classId, sectionId } = req.body;
  const data = await svc.calculateResults(req.schoolId, req.params.id, classId, sectionId);
  res.json({ success: true, data });
});

const classResults = h(async (req, res) => {
  const { classId, sectionId } = req.query;
  const data = await svc.getClassResults(req.schoolId, req.params.id, classId, sectionId);
  res.json({ success: true, data });
});

const studentResult = h(async (req, res) => {
  const data = await svc.getStudentResult(req.schoolId, req.params.studentId, req.params.id);
  res.json({ success: true, data });
});

const publishResults = h(async (req, res) => {
  const { classId, sectionId } = req.body;
  const data = await svc.publishResults(req.schoolId, req.params.id, classId, sectionId);
  await createAuditLog({ schoolId: req.schoolId, userId: req.user._id, action: 'RESULTS_PUBLISHED', entity: 'Exam', entityId: req.params.id });
  res.json({ success: true, data });
});

module.exports = { create, list, getOne, update, publish, complete, remove, addSchedule, updateSchedule, deleteSchedule, enterMarks, getMarks, studentsForExam, calculate, classResults, studentResult, publishResults };
