const svc = require('./fees.service');
const { asyncHandler }   = require('../../utils/asyncHandler');
const { createAuditLog } = require('../../utils/auditLog');

const h = asyncHandler;

// Structures
const createStructure = h(async (req, res) => {
  const data = await svc.createStructure(req.schoolId, req.body);
  await createAuditLog({ schoolId: req.schoolId, userId: req.user._id, action: 'FEE_STRUCTURE_CREATED', entity: 'FeeStructure', entityId: data._id, details: data.name });
  res.status(201).json({ success: true, data });
});

const listStructures = h(async (req, res) => {
  const data = await svc.listStructures(req.schoolId, req.query);
  res.json({ success: true, data });
});

const getStructure = h(async (req, res) => {
  const data = await svc.getStructure(req.schoolId, req.params.id);
  res.json({ success: true, data });
});

const updateStructure = h(async (req, res) => {
  const data = await svc.updateStructure(req.schoolId, req.params.id, req.body);
  res.json({ success: true, data });
});

const deleteStructure = h(async (req, res) => {
  await svc.deleteStructure(req.schoolId, req.params.id);
  res.json({ success: true, message: 'Deleted' });
});

// Invoices
const generateInvoices = h(async (req, res) => {
  const data = await svc.generateInvoices(req.schoolId, req.body);
  await createAuditLog({ schoolId: req.schoolId, userId: req.user._id, action: 'INVOICES_GENERATED', entity: 'FeeInvoice', details: `${data.created} created, ${data.skipped} skipped` });
  res.json({ success: true, data });
});

const listInvoices = h(async (req, res) => {
  const result = await svc.listInvoices(req.schoolId, req.query);
  res.json({ success: true, ...result });
});

const getInvoice = h(async (req, res) => {
  const data = await svc.getInvoice(req.schoolId, req.params.id);
  res.json({ success: true, data });
});

const applyConcession = h(async (req, res) => {
  const data = await svc.applyConcession(req.schoolId, req.params.id, req.body);
  await createAuditLog({ schoolId: req.schoolId, userId: req.user._id, action: 'CONCESSION_APPLIED', entity: 'FeeInvoice', entityId: data._id });
  res.json({ success: true, data });
});

const waiveInvoice = h(async (req, res) => {
  const data = await svc.waiveInvoice(req.schoolId, req.params.id, req.user._id, req.body.reason);
  await createAuditLog({ schoolId: req.schoolId, userId: req.user._id, action: 'INVOICE_WAIVED', entity: 'FeeInvoice', entityId: data._id });
  res.json({ success: true, data });
});

// Payments
const recordPayment = h(async (req, res) => {
  const data = await svc.recordPayment(req.schoolId, req.params.id, req.body, req.user._id);
  await createAuditLog({ schoolId: req.schoolId, userId: req.user._id, action: 'PAYMENT_RECORDED', entity: 'Payment', entityId: data.payment._id, details: `₹${data.payment.amount} - ${data.payment.receiptNo}` });
  res.json({ success: true, data });
});

const voidPayment = h(async (req, res) => {
  const data = await svc.voidPayment(req.schoolId, req.params.payId, req.user._id, req.body.reason);
  await createAuditLog({ schoolId: req.schoolId, userId: req.user._id, action: 'PAYMENT_VOIDED', entity: 'Payment', entityId: data._id });
  res.json({ success: true, data });
});

// Dashboard & Reports
const dashboard    = h(async (req, res) => { const data = await svc.getDashboard(req.schoolId); res.json({ success: true, data }); });
const outstanding  = h(async (req, res) => { const data = await svc.getOutstanding(req.schoolId, req.query); res.json({ success: true, data }); });

module.exports = { createStructure, listStructures, getStructure, updateStructure, deleteStructure, generateInvoices, listInvoices, getInvoice, applyConcession, waiveInvoice, recordPayment, voidPayment, dashboard, outstanding };
