const mongoose = require('mongoose');

const staffAttendanceSchema = new mongoose.Schema({
  schoolId:     { type: mongoose.Schema.Types.ObjectId, ref: 'School', required: true },
  staffId:      { type: mongoose.Schema.Types.ObjectId, ref: 'Staff', required: true },
  userId:       { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  date:         { type: Date, required: true },
  status:       { type: String, enum: ['present','absent','late','leave','half_day','work_from_home'], default: 'absent' },
  checkIn:      { type: String, default: '' },
  checkOut:     { type: String, default: '' },
  lateMinutes:  { type: Number, default: 0 },
  leaveType:    { type: String, enum: ['casual','sick','earned','maternity','other',''], default: '' },
  remark:       { type: String, default: '' },
  markedBy:     { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  isAutoAbsent: { type: Boolean, default: false },
}, { timestamps: true });

staffAttendanceSchema.index({ schoolId: 1, staffId: 1, date: 1 }, { unique: true });
staffAttendanceSchema.index({ schoolId: 1, date: 1 });

module.exports = mongoose.model('StaffAttendance', staffAttendanceSchema);
