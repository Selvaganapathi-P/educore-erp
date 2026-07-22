const mongoose = require('mongoose');

const academicYearSchema = new mongoose.Schema(
  {
    schoolId:  { type: mongoose.Schema.Types.ObjectId, ref: 'School', required: true },
    name:      { type: String, required: true, trim: true }, // "2024-25"
    startDate: { type: Date, required: true },
    endDate:   { type: Date, required: true },
    isCurrent: { type: Boolean, default: false },
    holidays: [{
      name:      { type: String, required: true },
      date:      { type: Date, required: true },
      type:      { type: String, enum: ['national','religious','school','other'], default: 'school' },
      optional:  { type: Boolean, default: false },
    }],
    workingDays:   { type: Number, default: 0 },    // calculated
    totalHolidays: { type: Number, default: 0 },
    isDeleted: { type: Boolean, default: false },
    deletedAt: Date,
  },
  { timestamps: true }
);

// Only one isCurrent per school
academicYearSchema.index({ schoolId: 1, isCurrent: 1 });
academicYearSchema.index({ schoolId: 1, name: 1 }, { unique: true });

const AcademicYear = mongoose.model('AcademicYear', academicYearSchema);
module.exports = { AcademicYear };
