const svc = require('./inventory.service');
const { asyncHandler } = require('../../utils/asyncHandler');

const getDashboard    = asyncHandler(async (req, res) => {
  const data = await svc.getDashboard(req.schoolId);
  res.json({ success: true, data });
});

const listItems = asyncHandler(async (req, res) => {
  const result = await svc.listItems(req.schoolId, req.query);
  res.json({ success: true, ...result });
});

const getItem = asyncHandler(async (req, res) => {
  const item = await svc.getItem(req.schoolId, req.params.id);
  if (!item) return res.status(404).json({ success: false, message: 'Item not found' });
  res.json({ success: true, data: item });
});

const createItem = asyncHandler(async (req, res) => {
  const item = await svc.createItem(req.schoolId, req.body, req.user._id);
  res.status(201).json({ success: true, data: item });
});

const updateItem = asyncHandler(async (req, res) => {
  const item = await svc.updateItem(req.schoolId, req.params.id, req.body, req.user._id);
  res.json({ success: true, data: item });
});

const deleteItem = asyncHandler(async (req, res) => {
  await svc.deleteItem(req.schoolId, req.params.id, req.user._id);
  res.json({ success: true, message: 'Deleted' });
});

const recordMovement = asyncHandler(async (req, res) => {
  const movement = await svc.recordMovement(req.schoolId, req.body, req.user._id);
  res.status(201).json({ success: true, data: movement });
});

const listMovements = asyncHandler(async (req, res) => {
  const result = await svc.listMovements(req.schoolId, req.query);
  res.json({ success: true, ...result });
});

module.exports = { getDashboard, listItems, getItem, createItem, updateItem, deleteItem, recordMovement, listMovements };
