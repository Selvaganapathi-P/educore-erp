const mongoose = require('mongoose');
const dayjs     = require('dayjs');
const FeeStructure = require('./feeStructure.model');
const FeeInvoice   = require('./feeInvoice.model');
const Payment      = require('./payment.model');

// ── Fee Structures ────────────────────────────────────────────────────────────

async function createStructure(schoolId, body) {
  const total = (body.items ?? []).filter(i => !i.isOptional).reduce((s, i) => s + i.amount, 0);
  return FeeStructure.create({
    schoolId,
    academicYearId: body.academicYearId,
    classId:    body.classId || undefined,
    name:        body.name,
    description: body.description || '',
    items:        body.items ?? [],
    totalAmount:  total,
  });
}

async function listStructures(schoolId, query) {
  const filter = { schoolId, isDeleted: false };
  if (query.academicYearId) filter.academicYearId = query.academicYearId;
  if (query.classId) filter.classId = query.classId;
  if (query.isActive !== undefined) filter.isActive = query.isActive === 'true';
  return FeeStructure.find(filter)
    .populate('classId',       'name')
    .populate('academicYearId','name')
    .sort({ createdAt: -1 });
}

async function getStructure(schoolId, id) {
  const s = await FeeStructure.findOne({ _id: id, schoolId, isDeleted: false })
    .populate('classId', 'name').populate('academicYearId', 'name');
  if (!s) throw Object.assign(new Error('Not found'), { status: 404 });
  return s;
}

async function updateStructure(schoolId, id, body) {
  const s = await FeeStructure.findOne({ _id: id, schoolId, isDeleted: false });
  if (!s) throw Object.assign(new Error('Not found'), { status: 404 });
  const allowed = ['name','description','items','isActive','classId'];
  for (const k of allowed) if (body[k] !== undefined) s[k] = body[k];
  if (body.items) s.totalAmount = body.items.filter(i => !i.isOptional).reduce((sum, i) => sum + i.amount, 0);
  return s.save();
}

async function deleteStructure(schoolId, id) {
  const s = await FeeStructure.findOne({ _id: id, schoolId, isDeleted: false });
  if (!s) throw Object.assign(new Error('Not found'), { status: 404 });
  s.isDeleted = true;
  return s.save();
}

// ── Invoice Generation ────────────────────────────────────────────────────────

async function generateInvoices(schoolId, body) {
  const structure = await FeeStructure.findOne({ _id: body.feeStructureId, schoolId, isDeleted: false });
  if (!structure) throw Object.assign(new Error('Fee structure not found'), { status: 404 });

  const Student = require('../students/student.model');
  const filter  = { schoolId, isDeleted: false };
  if (body.classId)   filter.currentClass   = body.classId;
  if (body.sectionId) filter.currentSection = new mongoose.Types.ObjectId(body.sectionId);

  const students = await Student.find(filter)
    .select('userId rollNumber currentClass currentSection')
    .lean();

  const lastInv = await FeeInvoice.findOne({ schoolId }).sort({ invoiceNo: -1 }).select('invoiceNo').lean();
  let counter   = lastInv ? (parseInt(lastInv.invoiceNo?.split('-').pop() ?? '0') + 1) : 1;
  const year    = new Date().getFullYear();

  const results = { created: 0, skipped: 0 };

  for (const student of students) {
    const exists = await FeeInvoice.findOne({ schoolId, studentId: student._id, feeStructureId: structure._id, period: body.period }).select('_id').lean();
    if (exists) { results.skipped++; continue; }

    const items = structure.items.map(item => ({
      head:        item.head,
      amount:      item.amount,
      concession:  0,
      concessionNote: '',
      finalAmount: item.amount,
    }));

    const total = items.reduce((s, i) => s + i.amount, 0);

    await FeeInvoice.create({
      schoolId,
      academicYearId: body.academicYearId || structure.academicYearId,
      studentId:  student._id,
      userId:     student.userId,
      classId:    student.currentClass,
      sectionId:  student.currentSection,
      feeStructureId: structure._id,
      invoiceNo:  `INV-${year}-${String(counter).padStart(5,'0')}`,
      period:     body.period,
      dueDate:    new Date(body.dueDate),
      items,
      totalAmount:    total,
      concessionTotal:0,
      lateFee:        0,
      netAmount:      total,
      paidAmount:     0,
      balanceAmount:  total,
      status:         'pending',
    });

    counter++;
    results.created++;
  }

  return results;
}

// ── Invoice CRUD ──────────────────────────────────────────────────────────────

async function listInvoices(schoolId, query) {
  const filter = { schoolId };
  if (query.studentId)      filter.studentId      = query.studentId;
  if (query.classId)        filter.classId        = query.classId;
  if (query.sectionId)      filter.sectionId      = new mongoose.Types.ObjectId(query.sectionId);
  if (query.feeStructureId) filter.feeStructureId = query.feeStructureId;
  if (query.period)         filter.period         = query.period;
  if (query.status) {
    const statuses = query.status.split(',').map(s => s.trim());
    filter.status = statuses.length === 1 ? statuses[0] : { $in: statuses };
  }

  const page  = Math.max(Number(query.page) || 1, 1);
  const limit = Math.min(Number(query.limit) || 25, 100);

  const [data, total] = await Promise.all([
    FeeInvoice.find(filter)
      .populate('studentId', 'rollNumber')
      .populate('userId',    'profile.firstName profile.lastName')
      .populate('classId',   'name')
      .sort({ dueDate: -1, createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit),
    FeeInvoice.countDocuments(filter),
  ]);

  return { data, total, page, pages: Math.ceil(total / limit) };
}

async function getInvoice(schoolId, id) {
  const inv = await FeeInvoice.findOne({ _id: id, schoolId })
    .populate('studentId',     'rollNumber')
    .populate('userId',        'profile.firstName profile.lastName profile.photo')
    .populate('classId',       'name')
    .populate('feeStructureId','name');
  if (!inv) throw Object.assign(new Error('Invoice not found'), { status: 404 });

  const payments = await Payment.find({ invoiceId: id, isVoid: false })
    .populate('collectedBy', 'profile.firstName profile.lastName')
    .sort({ paymentDate: -1 });

  return { ...inv.toObject(), payments };
}

async function applyConcession(schoolId, id, body) {
  const inv = await FeeInvoice.findOne({ _id: id, schoolId });
  if (!inv) throw Object.assign(new Error('Not found'), { status: 404 });

  if (body.itemHead) {
    const item = inv.items.find(i => i.head === body.itemHead);
    if (item) {
      item.concession     = Number(body.amount);
      item.concessionNote = body.note || '';
      item.finalAmount    = Math.max(0, item.amount - item.concession);
    }
  } else {
    // Distribute concession proportionally across all items
    const currentTotal = inv.totalAmount;
    for (const item of inv.items) {
      const share = currentTotal ? (item.amount / currentTotal) * Number(body.amount) : 0;
      item.concession     = Math.round(share);
      item.concessionNote = body.note || '';
      item.finalAmount    = Math.max(0, item.amount - item.concession);
    }
  }

  inv.concessionTotal = inv.items.reduce((s, i) => s + i.concession, 0);
  inv.netAmount       = Math.max(0, inv.totalAmount - inv.concessionTotal + inv.lateFee);
  inv.balanceAmount   = Math.max(0, inv.netAmount - inv.paidAmount);
  if (inv.balanceAmount <= 0) inv.status = 'paid';

  return inv.save();
}

async function waiveInvoice(schoolId, id, userId, reason) {
  const inv = await FeeInvoice.findOne({ _id: id, schoolId });
  if (!inv) throw Object.assign(new Error('Not found'), { status: 404 });
  inv.status      = 'waived';
  inv.waivedAt    = new Date();
  inv.waivedBy    = userId;
  inv.waivedReason= reason || '';
  return inv.save();
}

// ── Payment ───────────────────────────────────────────────────────────────────

async function recordPayment(schoolId, invoiceId, body, userId) {
  const inv = await FeeInvoice.findOne({ _id: invoiceId, schoolId });
  if (!inv)                  throw Object.assign(new Error('Invoice not found'), { status: 404 });
  if (inv.status === 'waived') throw Object.assign(new Error('Invoice is waived'), { status: 400 });
  if (inv.status === 'paid')   throw Object.assign(new Error('Invoice is already paid'), { status: 400 });

  const amount = Number(body.amount);
  if (amount <= 0)                throw Object.assign(new Error('Amount must be positive'), { status: 400 });
  if (amount > inv.balanceAmount) throw Object.assign(new Error(`Exceeds balance (₹${inv.balanceAmount})`), { status: 400 });

  const lastRcp = await Payment.findOne({ schoolId }).sort({ createdAt: -1 }).select('receiptNo').lean();
  const counter = lastRcp ? (parseInt(lastRcp.receiptNo?.split('-').pop() ?? '0') + 1) : 1;
  const year    = new Date().getFullYear();

  const payment = await Payment.create({
    schoolId,
    invoiceId,
    studentId:   inv.studentId,
    userId:      inv.userId,
    receiptNo:   `RCP-${year}-${String(counter).padStart(5,'0')}`,
    amount,
    paymentDate: body.paymentDate ? new Date(body.paymentDate) : new Date(),
    paymentMode: body.paymentMode || 'cash',
    reference:   body.reference  || '',
    collectedBy: userId,
    remarks:     body.remarks    || '',
  });

  inv.paidAmount    += amount;
  inv.balanceAmount  = Math.max(0, inv.netAmount - inv.paidAmount);
  inv.status         = inv.balanceAmount <= 0 ? 'paid' : 'partial';
  await inv.save();

  return { payment, invoice: inv };
}

async function voidPayment(schoolId, paymentId, userId, reason) {
  const pmt = await Payment.findOne({ _id: paymentId, schoolId });
  if (!pmt || pmt.isVoid) throw Object.assign(new Error('Payment not found or already voided'), { status: 404 });

  pmt.isVoid    = true;
  pmt.voidedAt  = new Date();
  pmt.voidedBy  = userId;
  pmt.voidReason= reason || '';
  await pmt.save();

  // Reverse invoice
  const inv = await FeeInvoice.findById(pmt.invoiceId);
  if (inv) {
    inv.paidAmount    = Math.max(0, inv.paidAmount - pmt.amount);
    inv.balanceAmount = Math.max(0, inv.netAmount - inv.paidAmount);
    inv.status        = inv.paidAmount <= 0 ? 'pending' : 'partial';
    await inv.save();
  }

  return pmt;
}

// ── Dashboard & Reports ───────────────────────────────────────────────────────

async function getDashboard(schoolId) {
  const sid = new mongoose.Types.ObjectId(schoolId);

  const [collected, outstanding, defaulters, recent, invoiceStats] = await Promise.all([
    Payment.aggregate([
      { $match: { schoolId: sid, isVoid: false } },
      { $group: { _id: null, total: { $sum: '$amount' }, count: { $sum: 1 } } },
    ]),
    FeeInvoice.aggregate([
      { $match: { schoolId: sid, status: { $in: ['pending','partial','overdue'] } } },
      { $group: { _id: null, total: { $sum: '$balanceAmount' }, count: { $sum: 1 } } },
    ]),
    FeeInvoice.distinct('studentId', { schoolId: sid, status: { $in: ['overdue'] } }),
    Payment.find({ schoolId, isVoid: false })
      .populate('userId',    'profile.firstName profile.lastName')
      .populate('invoiceId', 'invoiceNo period')
      .sort({ createdAt: -1 })
      .limit(8),
    FeeInvoice.aggregate([
      { $match: { schoolId: sid } },
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]),
  ]);

  const invByStatus = Object.fromEntries(invoiceStats.map(s => [s._id, s.count]));

  return {
    totalCollected:  collected[0]?.total  ?? 0,
    paymentCount:    collected[0]?.count  ?? 0,
    totalOutstanding:outstanding[0]?.total ?? 0,
    outstandingCount:outstanding[0]?.count ?? 0,
    defaulterCount:  defaulters.length,
    invoicesByStatus:invByStatus,
    recentPayments:  recent,
  };
}

async function getOutstanding(schoolId, query) {
  const filter = { schoolId, status: { $in: ['pending','partial','overdue'] } };
  if (query.classId)   filter.classId   = query.classId;
  if (query.sectionId) filter.sectionId = new mongoose.Types.ObjectId(query.sectionId);

  return FeeInvoice.find(filter)
    .populate('studentId', 'rollNumber')
    .populate('userId',    'profile.firstName profile.lastName')
    .populate('classId',   'name')
    .sort({ balanceAmount: -1, dueDate: 1 })
    .limit(200);
}

module.exports = {
  createStructure, listStructures, getStructure, updateStructure, deleteStructure,
  generateInvoices,
  listInvoices, getInvoice, applyConcession, waiveInvoice,
  recordPayment, voidPayment,
  getDashboard, getOutstanding,
};
