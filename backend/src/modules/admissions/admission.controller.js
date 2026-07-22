const svc = require('./admission.service');
const { sendSuccess, sendCreated, sendNoContent } = require('../../utils/apiResponse');
const { AuditLog } = require('../auth/auditLog.model');

const asyncHandler = fn => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

const create = asyncHandler(async (req, res) => {
  const admission = await svc.create(req.body, req.schoolId, req.user._id);
  await AuditLog.create({
    userId: req.user._id, action: 'CREATE', module: 'ADMISSION',
    description: `New admission application for ${req.body.student?.firstName} ${req.body.student?.lastName}`,
    resourceId: admission._id, ip: req.ip, userAgent: req.get('user-agent'), status: 'success',
  });
  sendCreated(res, admission, 'Admission created');
});

const list = asyncHandler(async (req, res) => {
  const { data, meta } = await svc.list(req.query, req.schoolId);
  sendSuccess(res, data, 'Admissions fetched', 200, meta);
});

const getById = asyncHandler(async (req, res) => {
  const admission = await svc.findById(req.params.id, req.schoolId);
  sendSuccess(res, admission, 'Admission fetched');
});

const update = asyncHandler(async (req, res) => {
  const admission = await svc.update(req.params.id, req.body, req.schoolId);
  sendSuccess(res, admission, 'Admission updated');
});

const updateStatus = asyncHandler(async (req, res) => {
  const admission = await svc.updateStatus(req.params.id, req.schoolId, req.body, req.user._id);
  await AuditLog.create({
    userId: req.user._id, action: 'UPDATE', module: 'ADMISSION',
    description: `Status → ${req.body.status} for application ${admission.applicationNo}`,
    resourceId: admission._id, ip: req.ip, userAgent: req.get('user-agent'), status: 'success',
  });
  sendSuccess(res, admission, `Status updated to ${req.body.status}`);
});

const enroll = asyncHandler(async (req, res) => {
  const { admission, student } = await svc.enroll(req.params.id, req.schoolId, req.user._id);
  await AuditLog.create({
    userId: req.user._id, action: 'CREATE', module: 'ADMISSION',
    description: `Enrolled student ${student.profile.firstName} ${student.profile.lastName} (${student.email})`,
    resourceId: admission._id, ip: req.ip, userAgent: req.get('user-agent'), status: 'success',
  });
  sendSuccess(res, { admission, student }, 'Student enrolled successfully');
});

const remove = asyncHandler(async (req, res) => {
  await svc.softDelete(req.params.id, req.schoolId);
  sendNoContent(res);
});

const getPipelineStats = asyncHandler(async (req, res) => {
  const stats = await svc.getPipelineStats(req.schoolId);
  sendSuccess(res, stats, 'Pipeline stats');
});

module.exports = { create, list, getById, update, updateStatus, enroll, remove, getPipelineStats };
