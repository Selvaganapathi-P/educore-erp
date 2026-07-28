const mongoose = require('mongoose');

const feeSchema = new mongoose.Schema({
  studentId:    { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
  feeType:      { type: String, enum: ['admission', 'tuition', 'exam', 'other'], required: true },
  description:  { type: String, default: '' },
  amount:       { type: Number, required: true, min: 0 },
  paidAmount:   { type: Number, default: 0 },
  dueDate:      { type: Date },
  paymentDate:  { type: Date },
  status:       { type: String, enum: ['paid', 'pending', 'partial'], default: 'pending' },
  paymentMode:  { type: String, enum: ['cash', 'online', 'cheque', 'upi', ''], default: '' },
  receiptNo:    { type: String, default: '' },
  academicYear: { type: String, required: true },
  addedBy:      { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

module.exports = mongoose.model('Fee', feeSchema);
