const mongoose = require('mongoose');

const CERT_TYPES = ['bonafide','character','transfer','participation','merit','experience','other'];

const certificateSchema = new mongoose.Schema({
  schoolId:       { type: mongoose.Schema.Types.ObjectId, ref: 'School', required: true, index: true },
  certNumber:     { type: String, required: true },
  type:           { type: String, enum: CERT_TYPES, required: true },
  recipientId:    { type: mongoose.Schema.Types.ObjectId, required: true, refPath: 'recipientModel' },
  recipientModel: { type: String, required: true, enum: ['Student','Staff'] },
  academicYearId: { type: mongoose.Schema.Types.ObjectId, ref: 'AcademicYear' },
  issuedDate:     { type: Date, default: Date.now },
  issuedBy:       { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  purpose:        { type: String },
  details:        { type: mongoose.Schema.Types.Mixed, default: {} },
  status:         { type: String, enum: ['draft','issued'], default: 'draft' },
  isDeleted:      { type: Boolean, default: false },
  deletedAt:      { type: Date },
}, { timestamps: true });

certificateSchema.index({ schoolId: 1, certNumber: 1 }, { unique: true });
certificateSchema.index({ schoolId: 1, recipientId: 1, type: 1 });

module.exports = mongoose.model('Certificate', certificateSchema);
