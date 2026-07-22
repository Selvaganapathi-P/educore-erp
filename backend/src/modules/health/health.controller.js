const svc = require('./health.service');
const { asyncHandler } = require('../../utils/asyncHandler');

const getDashboard   = asyncHandler(async (req, res) => {
  const data = await svc.getDashboard(req.schoolId);
  res.json({ success: true, data });
});

const listRecords    = asyncHandler(async (req, res) => {
  const result = await svc.listRecords(req.schoolId, req.query);
  res.json({ success: true, ...result });
});

const getRecord      = asyncHandler(async (req, res) => {
  const { memberId, memberModel } = req.query;
  if (!memberId || !memberModel) return res.status(400).json({ success: false, message: 'memberId and memberModel required' });
  const record = await svc.getRecord(req.schoolId, memberId, memberModel);
  res.json({ success: true, data: record ?? null });
});

const upsertRecord   = asyncHandler(async (req, res) => {
  const record = await svc.upsertRecord(req.schoolId, req.body, req.user._id);
  res.json({ success: true, data: record });
});

const listVisits     = asyncHandler(async (req, res) => {
  const result = await svc.listVisits(req.schoolId, req.query);
  res.json({ success: true, ...result });
});

const getVisit       = asyncHandler(async (req, res) => {
  const visit = await svc.getVisit(req.schoolId, req.params.id);
  if (!visit) return res.status(404).json({ success: false, message: 'Not found' });
  res.json({ success: true, data: visit });
});

const createVisit    = asyncHandler(async (req, res) => {
  const visit = await svc.createVisit(req.schoolId, req.body, req.user._id);
  res.status(201).json({ success: true, data: visit });
});

const updateVisit    = asyncHandler(async (req, res) => {
  const visit = await svc.updateVisit(req.schoolId, req.params.id, req.body, req.user._id);
  res.json({ success: true, data: visit });
});

const deleteVisit    = asyncHandler(async (req, res) => {
  await svc.deleteVisit(req.schoolId, req.params.id, req.user._id);
  res.json({ success: true, message: 'Deleted' });
});

module.exports = { getDashboard, listRecords, getRecord, upsertRecord, listVisits, getVisit, createVisit, updateVisit, deleteVisit };
