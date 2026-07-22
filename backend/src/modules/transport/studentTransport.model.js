const mongoose = require('mongoose');

const studentTransportSchema = new mongoose.Schema({
  schoolId:       { type: mongoose.Schema.Types.ObjectId, ref: 'School',       required: true, index: true },
  studentId:      { type: mongoose.Schema.Types.ObjectId, ref: 'Student',      required: true },
  userId:         { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  routeId:        { type: mongoose.Schema.Types.ObjectId, ref: 'Route',        required: true },
  academicYearId: { type: mongoose.Schema.Types.ObjectId, ref: 'AcademicYear', required: true },

  stopName:       { type: String, required: true },
  transportType:  { type: String, enum: ['pickup','drop','both'], default: 'both' },
  feeAmount:      { type: Number, default: 0 },
  isActive:       { type: Boolean, default: true },
}, { timestamps: true });

studentTransportSchema.index({ schoolId: 1, studentId: 1, academicYearId: 1 }, { unique: true });
studentTransportSchema.index({ schoolId: 1, routeId: 1 });

module.exports = mongoose.model('StudentTransport', studentTransportSchema);
