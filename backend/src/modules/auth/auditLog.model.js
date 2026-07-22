const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema(
  {
    schoolId:     { type: mongoose.Schema.Types.ObjectId, ref: 'School', default: null, index: true },
    userId:       { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    action:       { type: String, required: true },
    module:       { type: String, required: true },
    description:  { type: String, required: true },
    resourceId:   String,
    resourceType: String,
    changes: {
      before: { type: mongoose.Schema.Types.Mixed },
      after:  { type: mongoose.Schema.Types.Mixed },
    },
    ip:        { type: String, default: '' },
    userAgent: { type: String, default: '' },
    status:    { type: String, enum: ['success', 'failure'], default: 'success' },
  },
  { timestamps: true }
);

auditLogSchema.index({ createdAt: -1 });
auditLogSchema.index({ schoolId: 1, createdAt: -1 });
auditLogSchema.index({ userId:   1, createdAt: -1 });

const AuditLog = mongoose.model('AuditLog', auditLogSchema);
module.exports = { AuditLog };
