const mongoose = require('mongoose');

const hostelSchema = new mongoose.Schema({
  schoolId:     { type: mongoose.Schema.Types.ObjectId, ref: 'School', required: true, index: true },
  name:         { type: String, required: true, trim: true },
  type:         { type: String, enum: ['boys','girls','co_ed'], required: true },
  wardenId:     { type: mongoose.Schema.Types.ObjectId, ref: 'Staff' },
  capacity:     { type: Number, default: 0 },     // total beds (auto-summed from rooms)
  address:      { type: String },
  contactPhone: { type: String },
  amenities:    [{ type: String }],               // wifi, mess, laundry, etc.
  isActive:     { type: Boolean, default: true },
  isDeleted:    { type: Boolean, default: false },
  deletedAt:    { type: Date },
}, { timestamps: true });

module.exports = mongoose.model('Hostel', hostelSchema);
