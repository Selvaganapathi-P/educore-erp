const mongoose = require('mongoose');

const CATEGORIES = ['stationery','furniture','electronics','lab','sports','cleaning','medical','uniform','other'];

const itemSchema = new mongoose.Schema({
  schoolId:     { type: mongoose.Schema.Types.ObjectId, ref: 'School', required: true, index: true },
  name:         { type: String, required: true, trim: true },
  code:         { type: String, trim: true },
  category:     { type: String, enum: CATEGORIES, default: 'other' },
  unit:         { type: String, default: 'pcs' },
  currentStock: { type: Number, default: 0, min: 0 },
  minStock:     { type: Number, default: 0, min: 0 },
  unitPrice:    { type: Number, default: 0, min: 0 },
  location:     { type: String, trim: true },
  description:  { type: String },
  isDeleted:    { type: Boolean, default: false },
  deletedAt:    { type: Date },
}, { timestamps: true });

itemSchema.index({ schoolId: 1, isDeleted: 1 });
itemSchema.index({ schoolId: 1, code: 1 }, { unique: true, sparse: true });
itemSchema.index({ schoolId: 1, name: 'text', code: 'text', category: 'text' });

module.exports = mongoose.model('Item', itemSchema);
