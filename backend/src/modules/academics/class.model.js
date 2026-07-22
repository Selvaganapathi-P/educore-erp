const mongoose = require('mongoose');

const sectionSchema = new mongoose.Schema({
  name:          { type: String, required: true, trim: true }, // A, B, C
  classTeacher:  { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  roomNo:        String,
  capacity:      { type: Number, default: 40 },
  strength:      { type: Number, default: 0 },  // current count, updated on enrollment
  isDeleted:     { type: Boolean, default: false },
});

const classSchema = new mongoose.Schema(
  {
    schoolId:     { type: mongoose.Schema.Types.ObjectId, ref: 'School', required: true },
    academicYearId:{ type: mongoose.Schema.Types.ObjectId, ref: 'AcademicYear', required: true },
    name:         { type: String, required: true, trim: true }, // "Grade 1", "Class 10"
    displayOrder: { type: Number, default: 0 },
    sections:     [sectionSchema],
    isDeleted:    { type: Boolean, default: false },
    deletedAt:    Date,
  },
  { timestamps: true }
);

classSchema.index({ schoolId: 1, academicYearId: 1, name: 1 }, { unique: true });
classSchema.index({ schoolId: 1, academicYearId: 1, displayOrder: 1 });

const Class = mongoose.model('Class', classSchema);
module.exports = { Class };
