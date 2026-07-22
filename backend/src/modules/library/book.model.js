const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema({
  schoolId:      { type: mongoose.Schema.Types.ObjectId, ref: 'School', required: true, index: true },
  title:         { type: String, required: true, trim: true },
  author:        { type: String, required: true, trim: true },
  isbn:          { type: String, trim: true },
  category:      { type: String, trim: true },
  publisher:     { type: String, trim: true },
  edition:       { type: String, trim: true },
  language:      { type: String, default: 'English' },
  tags:          [{ type: String }],
  coverImage:    { type: String },
  location:      { type: String, trim: true },          // e.g. "Shelf A-3"
  totalCopies:   { type: Number, required: true, min: 0, default: 1 },
  availableCopies: { type: Number, required: true, min: 0, default: 1 },
  description:   { type: String },
  isDeleted:     { type: Boolean, default: false },
  deletedAt:     { type: Date },
}, { timestamps: true });

bookSchema.index({ schoolId: 1, isDeleted: 1 });
bookSchema.index({ schoolId: 1, isbn: 1 }, { unique: true, sparse: true });
bookSchema.index({ schoolId: 1, title: 'text', author: 'text', isbn: 'text', category: 'text' });

module.exports = mongoose.model('Book', bookSchema);
