const { z } = require('zod');
const { USER_ROLES } = require('../roles/role.model');

const rolesEnum = z.enum(USER_ROLES);

const createUserSchema = z.object({
  email:    z.string().email().toLowerCase().trim(),
  password: z.string().min(8)
    .regex(/[A-Z]/).regex(/[a-z]/).regex(/[0-9]/).regex(/[^A-Za-z0-9]/),
  role:     rolesEnum,
  schoolId: z.string().optional(),
  profile: z.object({
    firstName:   z.string().min(1).trim(),
    lastName:    z.string().min(1).trim(),
    phone:       z.string().optional(),
    gender:      z.enum(['male', 'female', 'other', 'prefer_not_to_say']).optional(),
    dateOfBirth: z.string().optional(),
    bloodGroup:  z.enum(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']).optional(),
    address:     z.string().optional(),
  }),
});

const updateUserSchema = z.object({
  profile: z.object({
    firstName:   z.string().min(1).trim().optional(),
    lastName:    z.string().min(1).trim().optional(),
    phone:       z.string().optional(),
    gender:      z.enum(['male', 'female', 'other', 'prefer_not_to_say']).optional(),
    dateOfBirth: z.string().optional(),
    bloodGroup:  z.enum(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']).optional(),
    address:     z.string().optional(),
  }).optional(),
  status:  z.enum(['active', 'inactive', 'suspended']).optional(),
  preferences: z.object({
    language: z.string().optional(),
    theme:    z.enum(['light', 'dark', 'system']).optional(),
  }).optional(),
});

const listUsersQuerySchema = z.object({
  page:      z.coerce.number().int().positive().default(1),
  limit:     z.coerce.number().int().min(1).max(100).default(20),
  search:    z.string().optional(),
  role:      rolesEnum.optional(),
  status:    z.enum(['active', 'inactive', 'suspended', 'pending']).optional(),
  sortBy:    z.enum(['createdAt', 'email', 'profile.firstName']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

module.exports = { createUserSchema, updateUserSchema, listUsersQuerySchema };
