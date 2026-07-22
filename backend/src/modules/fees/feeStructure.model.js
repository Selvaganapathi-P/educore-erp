const mongoose = require('mongoose');

const feeItemSchema = new mongoose.Schema({
  head:       { type: String, required: true },
  amount:     { type: Number, required: true, min: 0 },
  frequency:  { type: String, enum: ['monthly','quarterly','half_yearly','annual','one_time'], default: 'monthly' },
  isOptional: { type: Boolean, default: false },
}, { _id: false });

const feeStructureSchema = new mongoose.Schema({
  schoolId:       { type: mongoose.Schema.Types.ObjectId, ref: 'School',       required: true },
  academicYearId: { type: mongoose.Schema.Types.ObjectId, ref: 'AcademicYear', required: true },
  classId:        { type: mongoose.Schema.Types.ObjectId, ref: 'Class' },
  name:           { type: String, required: true, trim: true },
  description:    { type: String, default: '' },
  items:          [feeItemSchema],
  totalAmount:    { type: Number, default: 0 },
  isActive:       { type: Boolean, default: true },
  isDeleted:      { type: Boolean, default: false },
}, { timestamps: true });

feeStructureSchema.index({ schoolId: 1, academicYearId: 1, classId: 1 });

module.exports = mongoose.model('FeeStructure', feeStructureSchema);
