const schoolService = require('./school.service');
const { sendSuccess, sendCreated, sendNoContent } = require('../../utils/apiResponse');
const { AuditLog } = require('../auth/auditLog.model');

async function createSchool(req, res) {
  const school = await schoolService.create(req.body);
  await AuditLog.create({
    userId: req.user._id, action: 'CREATE', module: 'SCHOOL',
    description: `Created school "${school.name}"`, resourceId: school._id,
    ip: req.ip, userAgent: req.get('user-agent'), status: 'success',
  });
  sendCreated(res, school, 'School created successfully');
}

async function listSchools(req, res) {
  const { schools, meta } = await schoolService.list(req.query);
  sendSuccess(res, schools, 'Schools fetched', 200, meta);
}

async function getSchool(req, res) {
  const school = await schoolService.findById(req.params.id);
  sendSuccess(res, school, 'School fetched');
}

async function updateSchool(req, res) {
  const school = await schoolService.update(req.params.id, req.body);
  await AuditLog.create({
    userId: req.user._id, action: 'UPDATE', module: 'SCHOOL',
    description: `Updated school "${school.name}"`, resourceId: school._id,
    ip: req.ip, userAgent: req.get('user-agent'), status: 'success',
  });
  sendSuccess(res, school, 'School updated');
}

async function updateSchoolStatus(req, res) {
  const { status, reason } = req.body;
  const { school, previous } = await schoolService.updateStatus(req.params.id, status, reason);
  await AuditLog.create({
    userId: req.user._id, action: 'UPDATE', module: 'SCHOOL',
    description: `Status changed ${previous} → ${status} for "${school.name}"`,
    resourceId: school._id, ip: req.ip, userAgent: req.get('user-agent'), status: 'success',
  });
  sendSuccess(res, school, `School status updated to ${status}`);
}

async function deleteSchool(req, res) {
  await schoolService.softDelete(req.params.id);
  await AuditLog.create({
    userId: req.user._id, action: 'DELETE', module: 'SCHOOL',
    description: `Soft-deleted school id ${req.params.id}`,
    ip: req.ip, userAgent: req.get('user-agent'), status: 'success',
  });
  sendNoContent(res);
}

async function getSchoolStats(req, res) {
  const stats = await schoolService.getStats();
  sendSuccess(res, stats, 'Platform school statistics');
}

module.exports = { createSchool, listSchools, getSchool, updateSchool, updateSchoolStatus, deleteSchool, getSchoolStats };
