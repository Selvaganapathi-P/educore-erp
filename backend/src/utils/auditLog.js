const AuditLog = require('../modules/auth/auditLog.model');

const createAuditLog = async ({ schoolId, userId, action, entity, entityId, details }) => {
  try {
    await AuditLog.create({ schoolId, userId, action, entity, entityId, details });
  } catch {
    // Audit log failure must never crash the main request
  }
};

module.exports = { createAuditLog };
