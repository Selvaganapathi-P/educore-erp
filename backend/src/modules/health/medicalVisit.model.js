const mongoose = require('mongoose');

const prescriptionSchema = new mongoose.Schema({
  medicine: { type: String, required: true, trim: true },
  dosage:   { type: String, trim: true },
  duration: { type: String, trim: true },
}, { _id: false });

const medicalVisitSchema = new mongoose.Schema({
  schoolId:    { type: mongoose.Schema.Types.ObjectId, ref: 'School', required: true, index: true },
  memberId:    { type: mongoose.Schema.Types.ObjectId, required: true, refPath: 'memberModel' },
  memberModel: { type: String, required: true, enum: ['Student','Staff'] },

  visitDate:     { type: Date, default: Date.now },
  complaint:     { type: String, required: true, trim: true },
  diagnosis:     { type: String, trim: true },
  treatment:     { type: String, trim: true },
  prescriptions: [prescriptionSchema],

  temperatureF:  { type: Number },
  bp:            { type: String, trim: true },
  pulseRate:     { type: Number },

  followUpDate:  { type: Date },
  attendedBy:    { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  notes:         { type: String },

  isDeleted: { type: Boolean, default: false },
  deletedAt: { type: Date },
}, { timestamps: true });

medicalVisitSchema.index({ schoolId: 1, visitDate: -1 });
medicalVisitSchema.index({ schoolId: 1, memberId: 1, memberModel: 1 });

module.exports = mongoose.model('MedicalVisit', medicalVisitSchema);
