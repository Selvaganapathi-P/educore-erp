const mongoose = require('mongoose');

const roomSchema = new mongoose.Schema({
  schoolId:     { type: mongoose.Schema.Types.ObjectId, ref: 'School', required: true, index: true },
  hostelId:     { type: mongoose.Schema.Types.ObjectId, ref: 'Hostel', required: true },
  roomNumber:   { type: String, required: true, trim: true },
  floor:        { type: String, default: 'G' },
  roomType:     { type: String, enum: ['single','double','triple','dormitory'], default: 'double' },
  capacity:     { type: Number, required: true, min: 1 },
  occupiedBeds: { type: Number, default: 0, min: 0 },
  monthlyFee:   { type: Number, default: 0 },
  amenities:    [{ type: String }],
  status:       { type: String, enum: ['available','full','maintenance'], default: 'available' },
  notes:        { type: String },
  isDeleted:    { type: Boolean, default: false },
  deletedAt:    { type: Date },
}, { timestamps: true });

roomSchema.index({ schoolId: 1, hostelId: 1 });
roomSchema.index({ schoolId: 1, hostelId: 1, roomNumber: 1 }, { unique: true });

module.exports = mongoose.model('Room', roomSchema);
