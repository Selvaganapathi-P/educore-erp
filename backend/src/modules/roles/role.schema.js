const { z } = require('zod');
const { USER_ROLES } = require('./role.model');

const updateRolePermissionsSchema = z.object({
  permissions: z.array(z.string().min(1)).min(1, 'At least one permission required'),
});

const assignRoleSchema = z.object({
  userId: z.string().min(1),
  role:   z.enum(USER_ROLES),
});

module.exports = { updateRolePermissionsSchema, assignRoleSchema };
