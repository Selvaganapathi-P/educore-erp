const mongoose = require('mongoose');

const stopSchema = new mongoose.Schema({
  name:        { type: String, required: true, trim: true },
  order:       { type: Number, required: true },
  pickupTime:  { type: String },   // "07:30"
  dropTime:    { type: String },   // "14:00"
  distanceKm:  { type: Number, default: 0 },
  fare:        { type: Number, default: 0 },
}, { _id: false });

const routeSchema = new mongoose.Schema({
  schoolId:  { type: mongoose.Schema.Types.ObjectId, ref: 'School', required: true, index: true },
  name:      { type: String, required: true, trim: true },
  vehicleId: { type: mongoose.Schema.Types.ObjectId, ref: 'Vehicle' },
  stops:     [stopSchema],
  isActive:  { type: Boolean, default: true },
  notes:     { type: String },
  isDeleted: { type: Boolean, default: false },
  deletedAt: { type: Date },
}, { timestamps: true });

module.exports = mongoose.model('Route', routeSchema);
