const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  schoolId:   { type: mongoose.Schema.Types.ObjectId, ref: 'School', required: true, index: true },

  threadId:   { type: mongoose.Schema.Types.ObjectId, ref: 'Message', default: null },
  parentId:   { type: mongoose.Schema.Types.ObjectId, ref: 'Message', default: null },

  fromUserId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  toUserId:   { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },

  subject:    { type: String, required: true, trim: true },
  body:       { type: String, required: true },

  readByRecipient: { type: Boolean, default: false },
  readAt:          { type: Date },

  // Per-side soft delete
  deletedBySender:    { type: Boolean, default: false },
  deletedByRecipient: { type: Boolean, default: false },

  attachments: [{ name: String, url: String, type: String }],
}, { timestamps: true });

messageSchema.index({ schoolId: 1, toUserId: 1, createdAt: -1 });
messageSchema.index({ schoolId: 1, fromUserId: 1, createdAt: -1 });
messageSchema.index({ schoolId: 1, threadId: 1, createdAt: 1 });

module.exports = mongoose.model('Message', messageSchema);
