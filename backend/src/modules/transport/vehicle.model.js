const mongoose = require('mongoose');

const vehicleSchema = new mongoose.Schema({
  schoolId:        { type: mongoose.Schema.Types.ObjectId, ref: 'School', required: true, index: true },
  registrationNo:  { type: String, required: true, trim: true },
  vehicleType:     { type: String, enum: ['bus','van','auto','tempo'], default: 'bus' },
  model:           { type: String, trim: true },         // make / model name
  capacity:        { type: Number, required: true, min: 1 },
  color:           { type: String },

  driverId:        { type: mongoose.Schema.Types.ObjectId, ref: 'Staff' },
  conductorId:     { type: mongoose.Schema.Types.ObjectId, ref: 'Staff' },
  routeId:         { type: mongoose.Schema.Types.ObjectId, ref: 'Route' },

  insuranceExpiry: { type: Date },
  pucExpiry:       { type: Date },
  fitnessExpiry:   { type: Date },

  status:    { type: String, enum: ['active','maintenance','inactive'], default: 'active' },
  notes:     { type: String },
  isDeleted: { type: Boolean, default: false },
  deletedAt: { type: Date },
}, { timestamps: true });

vehicleSchema.index({ schoolId: 1, registrationNo: 1 }, { unique: true });

module.exports = mongoose.model('Vehicle', vehicleSchema);
