const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  role:      { type: String, enum: ['user','assistant'], required: true },
  content:   { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
}, { _id: false });

const aiConversationSchema = new mongoose.Schema({
  schoolId:  { type: mongoose.Schema.Types.ObjectId, ref: 'School', required: true, index: true },
  userId:    { type: mongoose.Schema.Types.ObjectId, ref: 'User',   required: true },
  title:     { type: String, default: 'New conversation' },
  messages:  [messageSchema],
  isDeleted: { type: Boolean, default: false },
  deletedAt: { type: Date },
}, { timestamps: true });

aiConversationSchema.index({ schoolId: 1, userId: 1, updatedAt: -1 });

module.exports = mongoose.model('AiConversation', aiConversationSchema);
