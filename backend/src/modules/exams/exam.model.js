const mongoose = require('mongoose');

const examSchema = new mongoose.Schema({
  schoolId:       { type: mongoose.Schema.Types.ObjectId, ref: 'School',       required: true },
  academicYearId: { type: mongoose.Schema.Types.ObjectId, ref: 'AcademicYear', required: true },
  name:        { type: String, required: true, trim: true },
  type:        { type: String, enum: ['unit_test','mid_term','final','quarterly','half_yearly','annual','mock','pre_board'], default: 'mid_term' },
  description: { type: String, default: '' },
  startDate:   { type: Date, required: true },
  endDate:     { type: Date, required: true },
  status:      { type: String, enum: ['draft','published','ongoing','completed','results_published'], default: 'draft' },
  publishedAt:        Date,
  completedAt:        Date,
  resultsPublishedAt: Date,
  isDeleted:   { type: Boolean, default: false },
  deletedAt:   Date,
}, { timestamps: true });

examSchema.index({ schoolId: 1, academicYearId: 1, status: 1 });
examSchema.index({ schoolId: 1, startDate: -1 });

module.exports = mongoose.model('Exam', examSchema);
