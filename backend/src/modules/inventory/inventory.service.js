const mongoose = require('mongoose');
const Item          = require('./item.model');
const StockMovement = require('./stockMovement.model');
const { createAuditLog } = require('../../utils/auditLog');

// ── Items ────────────────────────────────────────────────────────────────────

async function listItems(schoolId, { search, category, lowStock, page = 1, limit = 20 } = {}) {
  const filter = { schoolId, isDeleted: false };
  if (category) filter.category = category;
  if (lowStock === 'true' || lowStock === true) filter.$expr = { $lte: ['$currentStock', '$minStock'] };
  if (search) filter.$text = { $search: search };

  const [data, total] = await Promise.all([
    Item.find(filter).sort({ name: 1 }).skip((page - 1) * limit).limit(limit).lean(),
    Item.countDocuments(filter),
  ]);
  return { data, total, page: Number(page), pages: Math.ceil(total / limit) };
}

async function getItem(schoolId, itemId) {
  return Item.findOne({ _id: itemId, schoolId, isDeleted: false }).lean();
}

async function createItem(schoolId, body, userId) {
  const item = await Item.create({ schoolId, ...body });
  await createAuditLog({ schoolId, userId, action: 'CREATE', resource: 'Item', resourceId: item._id, detail: item.name });
  return item;
}

async function updateItem(schoolId, itemId, body, userId) {
  const item = await Item.findOneAndUpdate(
    { _id: itemId, schoolId, isDeleted: false },
    { $set: body },
    { new: true, runValidators: true },
  );
  if (!item) throw Object.assign(new Error('Item not found'), { status: 404 });
  await createAuditLog({ schoolId, userId, action: 'UPDATE', resource: 'Item', resourceId: item._id, detail: item.name });
  return item;
}

async function deleteItem(schoolId, itemId, userId) {
  const item = await Item.findOneAndUpdate(
    { _id: itemId, schoolId, isDeleted: false },
    { $set: { isDeleted: true, deletedAt: new Date() } },
    { new: true },
  );
  if (!item) throw Object.assign(new Error('Item not found'), { status: 404 });
  await createAuditLog({ schoolId, userId, action: 'DELETE', resource: 'Item', resourceId: item._id, detail: item.name });
}

// ── Stock movements ─────────────────────────────────────────────────────────

async function recordMovement(schoolId, body, userId) {
  const { itemId, type, quantity, issuedToId, issuedToModel, reference, notes, movedAt } = body;

  const item = await Item.findOne({ _id: itemId, schoolId, isDeleted: false });
  if (!item) throw Object.assign(new Error('Item not found'), { status: 404 });

  // Determine delta
  const isInbound = ['purchase','return','adjustment_in'].includes(type);
  const delta = isInbound ? quantity : -quantity;

  if (!isInbound && item.currentStock < quantity) {
    throw Object.assign(new Error(`Insufficient stock — available: ${item.currentStock} ${item.unit}`), { status: 400 });
  }

  item.currentStock = Math.max(0, item.currentStock + delta);
  await item.save();

  const movement = await StockMovement.create({
    schoolId, itemId, type, quantity, stockAfter: item.currentStock,
    issuedToId:    issuedToId    || undefined,
    issuedToModel: issuedToModel || undefined,
    reference, notes,
    movedAt: movedAt ? new Date(movedAt) : new Date(),
    movedBy: userId,
  });

  await createAuditLog({ schoolId, userId, action: 'CREATE', resource: 'StockMovement', resourceId: movement._id, detail: `${type} ${quantity} ${item.name}` });
  return movement;
}

async function listMovements(schoolId, { itemId, type, page = 1, limit = 30 } = {}) {
  const filter = { schoolId };
  if (itemId) filter.itemId = itemId;
  if (type)   filter.type   = type;

  const [data, total] = await Promise.all([
    StockMovement.find(filter)
      .sort({ movedAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate('itemId', 'name code unit')
      .populate('movedBy', 'profile')
      .populate({ path: 'issuedToId', select: 'profile rollNumber employeeId userId', populate: { path: 'userId', select: 'profile' } })
      .lean(),
    StockMovement.countDocuments(filter),
  ]);
  return { data, total, page: Number(page), pages: Math.ceil(total / limit) };
}

// ── Dashboard ────────────────────────────────────────────────────────────────

async function getDashboard(schoolId) {
  const sId = new mongoose.Types.ObjectId(String(schoolId));

  const [summary, lowStockItems, recentMovements, categoryStats] = await Promise.all([
    Item.aggregate([
      { $match: { schoolId: sId, isDeleted: false } },
      { $group: {
        _id: null,
        totalItems:   { $sum: 1 },
        totalValue:   { $sum: { $multiply: ['$currentStock', '$unitPrice'] } },
        lowStockCount:{ $sum: { $cond: [{ $lte: ['$currentStock', '$minStock'] }, 1, 0] } },
        outOfStock:   { $sum: { $cond: [{ $eq:  ['$currentStock', 0] }, 1, 0] } },
      }},
    ]),
    Item.find({ schoolId, isDeleted: false, $expr: { $lte: ['$currentStock', '$minStock'] } })
      .sort({ currentStock: 1 }).limit(10).lean(),
    StockMovement.find({ schoolId }).sort({ movedAt: -1 }).limit(10)
      .populate('itemId', 'name code unit').populate('movedBy', 'profile').lean(),
    Item.aggregate([
      { $match: { schoolId: sId, isDeleted: false } },
      { $group: { _id: '$category', count: { $sum: 1 }, totalStock: { $sum: '$currentStock' } } },
      { $sort: { count: -1 } },
    ]),
  ]);

  return {
    ...(summary[0] || { totalItems: 0, totalValue: 0, lowStockCount: 0, outOfStock: 0 }),
    lowStockItems,
    recentMovements,
    categoryStats,
  };
}

module.exports = { listItems, getItem, createItem, updateItem, deleteItem, recordMovement, listMovements, getDashboard };
