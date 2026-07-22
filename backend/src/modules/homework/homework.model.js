const mongoose = require('mongoose');

const attachmentSchema = new mongoose.Schema({
  name: String,
  url:  String,
  type: String,
}, { _id: false });

const homeworkSchema = new mongoose.Schema({
  schoolId:       { type: mongoose.Schema.Types.ObjectId, ref: 'School',       required: true },
  academicYearId: { type: mongoose.Schema.Types.ObjectId, ref: 'AcademicYear', required: true },
  classId:        { type: mongoose.Schema.Types.ObjectId, ref: 'Class',        required: true },
  sectionId:      { type: mongoose.Schema.Types.ObjectId },
  subjectId:      { type: mongoose.Schema.Types.ObjectId, ref: 'Subject' },
  teacherUserId:  { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  teacherId:      { type: mongoose.Schema.Types.ObjectId, ref: 'Staff' },
  title:          { type: String, required: true, trim: true, maxlength: 250 },
  description:    { type: String, default: '' },
  instructions:   { type: String, default: '' },
  dueDate:        { type: Date, required: true },
  type:           { type: String, enum: ['homework','assignment','project','classwork'], default: 'homework' },
  maxMarks:       { type: Number, default: 10, min: 0 },
  attachments:    [attachmentSchema],
  allowLateSubmission: { type: Boolean, default: true },
  latePenaltyPct: { type: Number, default: 0, min: 0, max: 100 },
  status:         { type: String, enum: ['draft','published','closed'], default: 'draft' },
  publishedAt:    Date,
  closedAt:       Date,
  isDeleted:      { type: Boolean, default: false },
  deletedAt:      Date,
}, { timestamps: true });

homeworkSchema.index({ schoolId: 1, classId: 1, dueDate: -1 });
homeworkSchema.index({ schoolId: 1, teacherUserId: 1, status: 1 });
homeworkSchema.index({ schoolId: 1, subjectId: 1 });

module.exports = mongoose.model('Homework', homeworkSchema);
