const { z } = require('zod');

const createSchoolSchema = z.object({
  name:  z.string().min(2).trim(),
  email: z.string().email().toLowerCase().trim(),
  phone: z.string().min(7).trim(),
  type:  z.enum(['primary','secondary','higher_secondary','k12','university']).default('k12'),
  board: z.string().optional(),
  website: z.string().url().optional().or(z.literal('')),
  address: z.object({
    street:  z.string().optional(),
    city:    z.string().optional(),
    state:   z.string().optional(),
    country: z.string().default('India'),
    pincode: z.string().optional(),
  }).optional(),
  subscriptionPlan: z.enum(['free','basic','standard','premium','enterprise']).default('free'),
  trialDays: z.coerce.number().int().min(0).max(90).default(14),
});

const updateSchoolSchema = createSchoolSchema.partial();

const schoolStatusSchema = z.object({
  status: z.enum(['active','inactive','suspended','trial']),
  reason: z.string().optional(),
});

const listSchoolsQuerySchema = z.object({
  page:      z.coerce.number().int().positive().default(1),
  limit:     z.coerce.number().int().min(1).max(100).default(20),
  search:    z.string().optional(),
  status:    z.enum(['active','inactive','suspended','trial']).optional(),
  plan:      z.enum(['free','basic','standard','premium','enterprise']).optional(),
  sortBy:    z.enum(['createdAt','name','status']).default('createdAt'),
  sortOrder: z.enum(['asc','desc']).default('desc'),
});

module.exports = { createSchoolSchema, updateSchoolSchema, schoolStatusSchema, listSchoolsQuerySchema };
