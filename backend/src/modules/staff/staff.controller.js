const svc = require('./staff.service');
const { sendSuccess, sendCreated, sendNoContent } = require('../../utils/apiResponse');

const asyncHandler = fn => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

const create = asyncHandler(async (req, res) => {
  const profile = await svc.create(req.body, req.schoolId);
  sendCreated(res, profile, 'Staff profile created');
});

const list = asyncHandler(async (req, res) => {
  const { data, meta } = await svc.list(req.query, req.schoolId);
  sendSuccess(res, data, 'Staff fetched', 200, meta);
});

const getById = asyncHandler(async (req, res) => {
  const profile = await svc.findById(req.params.id, req.schoolId);
  sendSuccess(res, profile, 'Staff profile fetched');
});

const getByUserId = asyncHandler(async (req, res) => {
  const profile = await svc.findByUserId(req.params.userId, req.schoolId);
  sendSuccess(res, profile, 'Staff profile fetched');
});

const update = asyncHandler(async (req, res) => {
  const profile = await svc.update(req.params.id, req.body, req.schoolId);
  sendSuccess(res, profile, 'Staff profile updated');
});

const remove = asyncHandler(async (req, res) => {
  await svc.softDelete(req.params.id, req.schoolId);
  sendNoContent(res);
});

const getDeptStats = asyncHandler(async (req, res) => {
  const stats = await svc.getDepartmentStats(req.schoolId);
  sendSuccess(res, stats, 'Department stats');
});

module.exports = { create, list, getById, getByUserId, update, remove, getDeptStats };
