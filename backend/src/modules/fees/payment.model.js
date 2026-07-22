const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  schoolId:    { type: mongoose.Schema.Types.ObjectId, ref: 'School',     required: true },
  invoiceId:   { type: mongoose.Schema.Types.ObjectId, ref: 'FeeInvoice', required: true },
  studentId:   { type: mongoose.Schema.Types.ObjectId, ref: 'Student' },
  userId:      { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  receiptNo:   { type: String, unique: true },
  amount:      { type: Number, required: true, min: 1 },
  paymentDate: { type: Date, required: true, default: Date.now },
  paymentMode: { type: String, enum: ['cash','cheque','online','upi','dd','card'], default: 'cash' },
  reference:   { type: String, default: '' },
  collectedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  remarks:     { type: String, default: '' },
  isVoid:      { type: Boolean, default: false },
  voidedAt:    Date,
  voidedBy:    { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  voidReason:  { type: String, default: '' },
}, { timestamps: true });

paymentSchema.index({ schoolId: 1, invoiceId: 1 });
paymentSchema.index({ schoolId: 1, studentId: 1 });
paymentSchema.index({ schoolId: 1, createdAt: -1 });

module.exports = mongoose.model('Payment', paymentSchema);
