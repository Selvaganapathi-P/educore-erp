const mongoose = require('mongoose');

const MOVEMENT_TYPES = ['purchase','issue','return','adjustment_in','adjustment_out'];

const stockMovementSchema = new mongoose.Schema({
  schoolId:       { type: mongoose.Schema.Types.ObjectId, ref: 'School', required: true, index: true },
  itemId:         { type: mongoose.Schema.Types.ObjectId, ref: 'Item',   required: true },
  type:           { type: String, enum: MOVEMENT_TYPES, required: true },
  quantity:       { type: Number, required: true, min: 1 },
  stockAfter:     { type: Number },
  issuedToId:     { type: mongoose.Schema.Types.ObjectId, refPath: 'issuedToModel' },
  issuedToModel:  { type: String, enum: ['Student','Staff'] },
  reference:      { type: String, trim: true },
  notes:          { type: String },
  movedAt:        { type: Date, default: Date.now },
  movedBy:        { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

stockMovementSchema.index({ schoolId: 1, itemId: 1, movedAt: -1 });
stockMovementSchema.index({ schoolId: 1, type: 1 });

module.exports = mongoose.model('StockMovement', stockMovementSchema);
