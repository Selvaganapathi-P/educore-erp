const svc = require('./homework.service');
const { asyncHandler }   = require('../../utils/asyncHandler');
const { createAuditLog } = require('../../utils/auditLog');

const h = asyncHandler;

const create = h(async (req, res) => {
  const data = await svc.createHomework(req.schoolId, req.body, req.user._id);
  await createAuditLog({ schoolId: req.schoolId, userId: req.user._id, action: 'HOMEWORK_CREATED', entity: 'Homework', entityId: data._id, details: data.title });
  res.status(201).json({ success: true, data });
});

const list = h(async (req, res) => {
  const result = await svc.listHomework(req.schoolId, req.query, req.user._id, req.user.role);
  res.json({ success: true, ...result });
});

const studentList = h(async (req, res) => {
  const data = await svc.listStudentHomework(req.schoolId, req.user._id, req.query);
  res.json({ success: true, data });
});

const getOne = h(async (req, res) => {
  const data = await svc.getHomework(req.schoolId, req.params.id);
  res.json({ success: true, data });
});

const stats = h(async (req, res) => {
  const data = await svc.getStats(req.schoolId, req.params.id);
  res.json({ success: true, data });
});

const update = h(async (req, res) => {
  const data = await svc.updateHomework(req.schoolId, req.params.id, req.body);
  res.json({ success: true, data });
});

const publish = h(async (req, res) => {
  const data = await svc.changeStatus(req.schoolId, req.params.id, 'published');
  res.json({ success: true, data });
});

const close = h(async (req, res) => {
  const data = await svc.changeStatus(req.schoolId, req.params.id, 'closed');
  res.json({ success: true, data });
});

const remove = h(async (req, res) => {
  await svc.deleteHomework(req.schoolId, req.params.id);
  res.json({ success: true, message: 'Homework deleted' });
});

const getSubmissions = h(async (req, res) => {
  const data = await svc.getSubmissions(req.schoolId, req.params.id);
  res.json({ success: true, data });
});

const submit = h(async (req, res) => {
  const data = await svc.submitHomework(req.schoolId, req.params.id, req.body, req.user._id);
  res.json({ success: true, data });
});

const grade = h(async (req, res) => {
  const data = await svc.gradeSubmission(req.schoolId, req.params.subId, req.body, req.user._id);
  await createAuditLog({ schoolId: req.schoolId, userId: req.user._id, action: 'SUBMISSION_GRADED', entity: 'Submission', entityId: data._id });
  res.json({ success: true, data });
});

module.exports = { create, list, studentList, getOne, stats, update, publish, close, remove, getSubmissions, submit, grade };
