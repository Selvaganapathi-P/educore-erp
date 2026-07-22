const mongoose = require('mongoose');

const EVENT_TYPES = ['academic','sports','cultural','holiday','meeting','exam','workshop','trip','other'];
const AUDIENCE    = ['all','students','staff','parents','classes'];

const eventSchema = new mongoose.Schema({
  schoolId:       { type: mongoose.Schema.Types.ObjectId, ref: 'School', required: true, index: true },
  title:          { type: String, required: true, trim: true },
  description:    { type: String },
  type:           { type: String, enum: EVENT_TYPES, default: 'other' },
  startDate:      { type: Date, required: true },
  endDate:        { type: Date },
  venue:          { type: String, trim: true },
  targetAudience: { type: String, enum: AUDIENCE, default: 'all' },
  targetClasses:  [{ type: mongoose.Schema.Types.ObjectId, ref: 'Class' }],
  organizerId:    { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  isPublished:    { type: Boolean, default: false },
  isDeleted:      { type: Boolean, default: false },
  deletedAt:      { type: Date },
}, { timestamps: true });

eventSchema.index({ schoolId: 1, startDate: 1 });
eventSchema.index({ schoolId: 1, isDeleted: 1, isPublished: 1 });

module.exports = mongoose.model('Event', eventSchema);
