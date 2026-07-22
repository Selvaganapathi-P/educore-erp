const mongoose = require('mongoose');

const ticketSchema = new mongoose.Schema(
  {
    schoolId:   { type: mongoose.Schema.Types.ObjectId, ref: 'School', default: null },
    userId:     { type: mongoose.Schema.Types.ObjectId, ref: 'User',   required: true },
    ticketNo:   { type: String, unique: true },
    subject:    { type: String, required: true },
    description:{ type: String, required: true },
    category:   { type: String, enum: ['technical','billing','feature','other'], default: 'technical' },
    priority:   { type: String, enum: ['low','medium','high','urgent'], default: 'medium' },
    status:     { type: String, enum: ['open','in_progress','resolved','closed'], default: 'open' },
    assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    replies: [{
      userId:    { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      message:   String,
      isStaff:   { type: Boolean, default: false },
      createdAt: { type: Date, default: Date.now },
    }],
    attachments: [String],
    resolvedAt:  Date,
    closedAt:    Date,
  },
  { timestamps: true }
);

ticketSchema.pre('save', async function (next) {
  if (!this.ticketNo) {
    const count  = await mongoose.model('SupportTicket').countDocuments();
    this.ticketNo = `TKT-${String(count + 1).padStart(5, '0')}`;
  }
  next();
});

ticketSchema.index({ schoolId: 1, status: 1 });
ticketSchema.index({ userId: 1 });
ticketSchema.index({ createdAt: -1 });

const SupportTicket = mongoose.model('SupportTicket', ticketSchema);
module.exports = { SupportTicket };
