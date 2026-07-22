const mongoose = require('mongoose');

const attachmentSchema = new mongoose.Schema({
  name: String,
  url:  String,
  type: String,
}, { _id: false });

const announcementSchema = new mongoose.Schema({
  schoolId:   { type: mongoose.Schema.Types.ObjectId, ref: 'School', required: true, index: true },
  title:      { type: String, required: true, trim: true },
  content:    { type: String, required: true },
  type:       { type: String, enum: ['general','event','urgent','holiday','exam','fee'], default: 'general' },

  // Audience targeting
  targetAudience: { type: String, enum: ['all','roles','classes'], default: 'all' },
  targetRoles:    [{ type: String }],
  targetClasses:  [{ type: mongoose.Schema.Types.ObjectId, ref: 'Class' }],

  attachments: [attachmentSchema],

  isPublished: { type: Boolean, default: false },
  publishedAt: { type: Date },
  expiresAt:   { type: Date },

  createdBy:  { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  isDeleted:  { type: Boolean, default: false },
  deletedAt:  { type: Date },
}, { timestamps: true });

announcementSchema.index({ schoolId: 1, isPublished: 1, publishedAt: -1 });

module.exports = mongoose.model('Announcement', announcementSchema);
