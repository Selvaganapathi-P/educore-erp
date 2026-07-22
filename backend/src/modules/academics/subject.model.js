const mongoose = require('mongoose');

const subjectSchema = new mongoose.Schema(
  {
    schoolId:      { type: mongoose.Schema.Types.ObjectId, ref: 'School', required: true },
    academicYearId:{ type: mongoose.Schema.Types.ObjectId, ref: 'AcademicYear', required: true },
    name:          { type: String, required: true, trim: true },
    code:          { type: String, trim: true },
    type:          { type: String, enum: ['theory','practical','both','activity'], default: 'theory' },
    isElective:    { type: Boolean, default: false },
    isMandatory:   { type: Boolean, default: true },
    creditHours:   { type: Number, default: 1 },
    color:         { type: String, default: '#3B82F6' }, // for timetable display
    // Which classes this subject is assigned to
    classes: [{
      classId:   { type: mongoose.Schema.Types.ObjectId, ref: 'Class' },
      teacherId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
      periodsPerWeek: { type: Number, default: 5 },
    }],
    maxMarks:    { type: Number, default: 100 },
    passMarks:   { type: Number, default: 33  },
    isDeleted:   { type: Boolean, default: false },
    deletedAt:   Date,
  },
  { timestamps: true }
);

subjectSchema.index({ schoolId: 1, academicYearId: 1, code: 1 });
subjectSchema.index({ schoolId: 1, academicYearId: 1, name: 1 });

const Subject = mongoose.model('Subject', subjectSchema);
module.exports = { Subject };
