const mongoose = require('mongoose');

const hostelAllotmentSchema = new mongoose.Schema({
  schoolId:       { type: mongoose.Schema.Types.ObjectId, ref: 'School',       required: true, index: true },
  studentId:      { type: mongoose.Schema.Types.ObjectId, ref: 'Student',      required: true },
  userId:         { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  hostelId:       { type: mongoose.Schema.Types.ObjectId, ref: 'Hostel',       required: true },
  roomId:         { type: mongoose.Schema.Types.ObjectId, ref: 'Room',         required: true },
  academicYearId: { type: mongoose.Schema.Types.ObjectId, ref: 'AcademicYear', required: true },
  bedNumber:      { type: String },
  joinDate:       { type: Date, required: true, default: Date.now },
  leaveDate:      { type: Date },
  feeAmount:      { type: Number, default: 0 },
  status:         { type: String, enum: ['active','left','transferred'], default: 'active' },
  leftReason:     { type: String },
  allottedBy:     { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

// One active allotment per student per academic year
hostelAllotmentSchema.index(
  { schoolId: 1, studentId: 1, academicYearId: 1, status: 1 },
  { unique: true, partialFilterExpression: { status: 'active' } }
);
hostelAllotmentSchema.index({ schoolId: 1, roomId: 1, status: 1 });

module.exports = mongoose.model('HostelAllotment', hostelAllotmentSchema);
