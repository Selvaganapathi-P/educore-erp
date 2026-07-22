const mongoose = require('mongoose');

const subjectResultSchema = new mongoose.Schema({
  scheduleId:     { type: mongoose.Schema.Types.ObjectId, ref: 'ExamSchedule' },
  subjectId:      { type: mongoose.Schema.Types.ObjectId, ref: 'Subject' },
  subjectName:    String,
  marksObtained:  { type: Number, default: 0 },
  maxMarks:       { type: Number, default: 100 },
  passMark:       { type: Number, default: 33 },
  grade:          { type: String, default: '' },
  gradePoint:     { type: Number, default: 0 },
  isPassed:       { type: Boolean, default: false },
  isAbsent:       { type: Boolean, default: false },
  remarks:        { type: String, default: '' },
}, { _id: false });

const examResultSchema = new mongoose.Schema({
  schoolId:       { type: mongoose.Schema.Types.ObjectId, ref: 'School',       required: true },
  examId:         { type: mongoose.Schema.Types.ObjectId, ref: 'Exam',         required: true },
  academicYearId: { type: mongoose.Schema.Types.ObjectId, ref: 'AcademicYear' },
  studentId:      { type: mongoose.Schema.Types.ObjectId, ref: 'Student',      required: true },
  userId:         { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  classId:        { type: mongoose.Schema.Types.ObjectId, ref: 'Class' },
  sectionId:      { type: mongoose.Schema.Types.ObjectId },
  subjectResults: [subjectResultSchema],
  totalMarks:     { type: Number, default: 0 },
  totalObtained:  { type: Number, default: 0 },
  percentage:     { type: Number, default: 0 },
  grade:          { type: String, default: '' },
  gradePoint:     { type: Number, default: 0 },
  rank:           { type: Number, default: 0 },
  isPassed:       { type: Boolean, default: false },
  isPublished:    { type: Boolean, default: false },
  publishedAt:    Date,
}, { timestamps: true });

examResultSchema.index({ examId: 1, studentId: 1 }, { unique: true });
examResultSchema.index({ schoolId: 1, examId: 1, classId: 1, sectionId: 1 });
examResultSchema.index({ schoolId: 1, studentId: 1 });

module.exports = mongoose.model('ExamResult', examResultSchema);
