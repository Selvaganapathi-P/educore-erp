const svc = require('./student.service');
const { sendSuccess, sendCreated, sendNoContent } = require('../../utils/apiResponse');

const asyncHandler = fn => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

const create = asyncHandler(async (req, res) => {
  const profile = await svc.create(req.body, req.schoolId);
  sendCreated(res, profile, 'Student profile created');
});

const list = asyncHandler(async (req, res) => {
  const { data, meta } = await svc.list(req.query, req.schoolId);
  sendSuccess(res, data, 'Students fetched', 200, meta);
});

const getById = asyncHandler(async (req, res) => {
  const profile = await svc.findById(req.params.id, req.schoolId);
  sendSuccess(res, profile, 'Student profile fetched');
});

const getByUserId = asyncHandler(async (req, res) => {
  const profile = await svc.findByUserId(req.params.userId, req.schoolId);
  sendSuccess(res, profile, 'Student profile fetched');
});

const update = asyncHandler(async (req, res) => {
  const profile = await svc.update(req.params.id, req.body, req.schoolId);
  sendSuccess(res, profile, 'Student profile updated');
});

const remove = asyncHandler(async (req, res) => {
  await svc.softDelete(req.params.id, req.schoolId);
  sendNoContent(res);
});

const getStats = asyncHandler(async (req, res) => {
  const stats = await svc.getStats(req.schoolId);
  sendSuccess(res, stats, 'Student stats');
});

module.exports = { create, list, getById, getByUserId, update, remove, getStats };
