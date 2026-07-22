const { z } = require('zod');

const createStaffSchema = z.object({
  userId:         z.string().min(1, 'userId required'),
  department:     z.string().min(1, 'Department required'),
  designation:    z.string().min(1, 'Designation required'),
  joiningDate:    z.string().min(1, 'Joining date required'),
  employmentType: z.enum(['permanent','contractual','part_time','visiting','probation']).default('permanent'),
  reportingTo:    z.string().optional(),
  subjects:       z.array(z.string()).optional(),
  classes:        z.array(z.string()).optional(),
  biometricId:    z.string().optional(),
  rfidCard:       z.string().optional(),
  emergencyContact: z.object({
    name:         z.string().optional(),
    relationship: z.string().optional(),
    phone:        z.string().optional(),
  }).optional(),
  qualifications: z.array(z.object({
    degree:      z.string(),
    subject:     z.string().optional(),
    institution: z.string().optional(),
    year:        z.coerce.number().optional(),
    percentage:  z.coerce.number().optional(),
  })).optional(),
  experience: z.array(z.object({
    title:        z.string(),
    organization: z.string(),
    from:         z.string(),
    to:           z.string().optional(),
    isCurrent:    z.boolean().default(false),
    description:  z.string().optional(),
  })).optional(),
  salary: z.object({
    grade: z.string().optional(),
    basic: z.coerce.number().optional(),
  }).optional(),
  leaveBalance: z.object({
    casual:  z.coerce.number().default(12),
    sick:    z.coerce.number().default(7),
    earned:  z.coerce.number().default(15),
  }).optional(),
});

const updateStaffSchema = createStaffSchema.omit({ userId: true }).partial();

const listStaffQuerySchema = z.object({
  page:           z.coerce.number().int().positive().default(1),
  limit:          z.coerce.number().int().min(1).max(100).default(25),
  search:         z.string().optional(),
  department:     z.string().optional(),
  employmentType: z.string().optional(),
  status:         z.string().optional(),
  sortBy:         z.enum(['createdAt','employeeId','joiningDate']).default('employeeId'),
  sortOrder:      z.enum(['asc','desc']).default('asc'),
});

module.exports = { createStaffSchema, updateStaffSchema, listStaffQuerySchema };
