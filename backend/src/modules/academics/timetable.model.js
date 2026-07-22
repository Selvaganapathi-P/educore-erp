const mongoose = require('mongoose');

// One timetable document per class+section+academicYear
const periodSchema = new mongoose.Schema({
  periodNo:   { type: Number, required: true },  // 1..8
  startTime:  { type: String, required: true },  // "08:00"
  endTime:    { type: String, required: true },
  subjectId:  { type: mongoose.Schema.Types.ObjectId, ref: 'Subject', default: null },
  teacherId:  { type: mongoose.Schema.Types.ObjectId, ref: 'User',    default: null },
  roomNo:     String,
  isBreak:    { type: Boolean, default: false },
  breakLabel: String,  // "Lunch Break", "Short Break"
});

const dayScheduleSchema = new mongoose.Schema({
  day:     { type: Number, required: true, min: 0, max: 6 }, // 0=Sun, 1=Mon…
  periods: [periodSchema],
});

const timetableSchema = new mongoose.Schema(
  {
    schoolId:       { type: mongoose.Schema.Types.ObjectId, ref: 'School',       required: true },
    academicYearId: { type: mongoose.Schema.Types.ObjectId, ref: 'AcademicYear', required: true },
    classId:        { type: mongoose.Schema.Types.ObjectId, ref: 'Class',        required: true },
    sectionId:      { type: mongoose.Schema.Types.ObjectId },
    sectionName:    String,
    effectiveFrom:  { type: Date, default: Date.now },
    isActive:       { type: Boolean, default: true },
    schedule:       [dayScheduleSchema],  // array of day entries
    isDeleted:      { type: Boolean, default: false },
  },
  { timestamps: true }
);

timetableSchema.index({ schoolId: 1, classId: 1, sectionId: 1, isActive: 1 });

const Timetable = mongoose.model('Timetable', timetableSchema);
module.exports = { Timetable };
