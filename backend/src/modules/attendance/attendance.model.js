const mongoose = require('mongoose');

const entrySchema = new mongoose.Schema({
  studentId:    { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
  userId:       { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  rollNumber:   String,
  status:       { type: String, enum: ['present','absent','late','leave','half_day'], default: 'absent' },
  lateMinutes:  { type: Number, default: 0 },
  leaveType:    { type: String, enum: ['casual','sick','other',''], default: '' },
  remark:       { type: String, default: '' },
  isAutoAbsent: { type: Boolean, default: false },
}, { _id: false });

const attendanceSchema = new mongoose.Schema({
  schoolId:       { type: mongoose.Schema.Types.ObjectId, ref: 'School', required: true },
  academicYearId: { type: mongoose.Schema.Types.ObjectId, ref: 'AcademicYear', required: true },
  classId:        { type: mongoose.Schema.Types.ObjectId, ref: 'Class', required: true },
  sectionId:      { type: mongoose.Schema.Types.ObjectId, required: true },
  date:           { type: Date, required: true },
  entries:        [entrySchema],
  markedBy:       { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  markedAt:       Date,
  isLocked:       { type: Boolean, default: false },
  lockedAt:       Date,
}, { timestamps: true });

attendanceSchema.index({ schoolId: 1, classId: 1, sectionId: 1, date: 1 }, { unique: true });
attendanceSchema.index({ schoolId: 1, date: 1 });
attendanceSchema.index({ 'entries.studentId': 1, date: 1 });

module.exports = mongoose.model('Attendance', attendanceSchema);
