const mongoose = require('mongoose');

const examScheduleSchema = new mongoose.Schema({
  schoolId:   { type: mongoose.Schema.Types.ObjectId, ref: 'School', required: true },
  examId:     { type: mongoose.Schema.Types.ObjectId, ref: 'Exam',   required: true },
  classId:    { type: mongoose.Schema.Types.ObjectId, ref: 'Class',  required: true },
  subjectId:  { type: mongoose.Schema.Types.ObjectId, ref: 'Subject' },
  subjectName:{ type: String },  // denormalized for display when subject deleted
  date:       { type: Date, required: true },
  startTime:  { type: String, default: '09:00' },
  endTime:    { type: String, default: '11:00' },
  maxMarks:   { type: Number, required: true, min: 1 },
  passMark:   { type: Number, required: true, min: 0 },
  roomNo:     { type: String, default: '' },
  invigilators: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  isDeleted:  { type: Boolean, default: false },
}, { timestamps: true });

examScheduleSchema.index({ examId: 1, classId: 1 });
examScheduleSchema.index({ schoolId: 1, examId: 1 });

module.exports = mongoose.model('ExamSchedule', examScheduleSchema);
