const mongoose = require('mongoose');

const invoiceItemSchema = new mongoose.Schema({
  head:           { type: String, required: true },
  amount:         { type: Number, required: true },
  concession:     { type: Number, default: 0 },
  concessionNote: { type: String, default: '' },
  finalAmount:    { type: Number, required: true },
}, { _id: false });

const feeInvoiceSchema = new mongoose.Schema({
  schoolId:       { type: mongoose.Schema.Types.ObjectId, ref: 'School',       required: true },
  academicYearId: { type: mongoose.Schema.Types.ObjectId, ref: 'AcademicYear' },
  studentId:      { type: mongoose.Schema.Types.ObjectId, ref: 'Student',      required: true },
  userId:         { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  classId:        { type: mongoose.Schema.Types.ObjectId, ref: 'Class' },
  sectionId:      { type: mongoose.Schema.Types.ObjectId },
  feeStructureId: { type: mongoose.Schema.Types.ObjectId, ref: 'FeeStructure' },
  invoiceNo:      { type: String, unique: true },
  period:         { type: String, required: true },
  dueDate:        { type: Date,   required: true },
  items:          [invoiceItemSchema],
  totalAmount:    { type: Number, default: 0 },
  concessionTotal:{ type: Number, default: 0 },
  lateFee:        { type: Number, default: 0 },
  netAmount:      { type: Number, default: 0 },
  paidAmount:     { type: Number, default: 0 },
  balanceAmount:  { type: Number, default: 0 },
  status:         { type: String, enum: ['pending','partial','paid','overdue','waived'], default: 'pending' },
  waivedAt:       Date,
  waivedBy:       { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  waivedReason:   { type: String, default: '' },
  notes:          { type: String, default: '' },
}, { timestamps: true });

feeInvoiceSchema.index({ schoolId: 1, studentId: 1, period: 1 });
feeInvoiceSchema.index({ schoolId: 1, classId: 1, status: 1 });
feeInvoiceSchema.index({ schoolId: 1, status: 1, dueDate: 1 });

module.exports = mongoose.model('FeeInvoice', feeInvoiceSchema);
