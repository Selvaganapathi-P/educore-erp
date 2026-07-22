const mongoose = require('mongoose');

const BLOOD_GROUPS = ['A+','A-','B+','B-','AB+','AB-','O+','O-','unknown'];

const healthRecordSchema = new mongoose.Schema({
  schoolId:    { type: mongoose.Schema.Types.ObjectId, ref: 'School', required: true, index: true },
  memberId:    { type: mongoose.Schema.Types.ObjectId, required: true, refPath: 'memberModel' },
  memberModel: { type: String, required: true, enum: ['Student','Staff'] },

  bloodGroup:         { type: String, enum: BLOOD_GROUPS, default: 'unknown' },
  heightCm:           { type: Number },
  weightKg:           { type: Number },
  allergies:          [{ type: String, trim: true }],
  chronicConditions:  [{ type: String, trim: true }],
  disabilities:       [{ type: String, trim: true }],

  emergencyContactName:     { type: String, trim: true },
  emergencyContactPhone:    { type: String, trim: true },
  emergencyContactRelation: { type: String, trim: true },

  insuranceProvider: { type: String, trim: true },
  insurancePolicyNo: { type: String, trim: true },
  notes:             { type: String },

  isDeleted: { type: Boolean, default: false },
  deletedAt: { type: Date },
}, { timestamps: true });

healthRecordSchema.index({ schoolId: 1, memberId: 1, memberModel: 1 }, { unique: true });

module.exports = mongoose.model('HealthRecord', healthRecordSchema);
