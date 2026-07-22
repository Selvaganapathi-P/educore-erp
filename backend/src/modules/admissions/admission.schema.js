const { z } = require('zod');

const studentSchema = z.object({
  firstName:    z.string().min(1, 'First name required').trim(),
  lastName:     z.string().min(1, 'Last name required').trim(),
  dateOfBirth:  z.string().min(1, 'Date of birth required'),
  gender:       z.enum(['male','female','other']),
  bloodGroup:   z.string().optional(),
  nationality:  z.string().default('Indian'),
  religion:     z.string().optional(),
  category:     z.enum(['general','obc','sc','st','ews','other']).default('general'),
  motherTongue: z.string().optional(),
  aadhaarNo:    z.string().optional(),
});

const guardianSchema = z.object({
  name:         z.string().optional(),
  phone:        z.string().optional(),
  email:        z.string().email().optional().or(z.literal('')),
  occupation:   z.string().optional(),
  qualification:z.string().optional(),
  income:       z.coerce.number().optional(),
}).optional();

const createAdmissionSchema = z.object({
  student:          studentSchema,
  applyingForClass: z.string().min(1, 'Class required'),
  applyingForYear:  z.string().min(1, 'Year required'),
  previousSchool:   z.object({
    name:       z.string().optional(),
    class:      z.string().optional(),
    board:      z.string().optional(),
    percentage: z.coerce.number().optional(),
    tcNumber:   z.string().optional(),
  }).optional(),
  father:   guardianSchema,
  mother:   guardianSchema,
  guardian: guardianSchema,
  address: z.object({
    street:  z.string().optional(),
    city:    z.string().optional(),
    state:   z.string().optional(),
    pincode: z.string().optional(),
    country: z.string().default('India'),
  }).optional(),
  source:     z.enum(['walk_in','online','referral','campaign','other']).default('online'),
  referredBy: z.string().optional(),
  notes:      z.string().optional(),
  admissionFee: z.coerce.number().min(0).default(0),
  documentsRequired: z.array(z.string()).optional(),
});

const updateAdmissionSchema = createAdmissionSchema.partial();

const updateStatusSchema = z.object({
  status: z.enum([
    'enquiry','applied','documents_pending','under_review',
    'interview_scheduled','approved','waitlisted','enrolled','rejected',
  ]),
  note:              z.string().optional(),
  interviewDate:     z.string().optional(),
  rejectionReason:   z.string().optional(),
  waitlistPosition:  z.coerce.number().int().positive().optional(),
});

const listAdmissionsQuerySchema = z.object({
  page:      z.coerce.number().int().positive().default(1),
  limit:     z.coerce.number().int().min(1).max(100).default(20),
  search:    z.string().optional(),
  status:    z.string().optional(),
  class:     z.string().optional(),
  year:      z.string().optional(),
  source:    z.string().optional(),
  sortBy:    z.enum(['createdAt','applicationNo','student.firstName','status']).default('createdAt'),
  sortOrder: z.enum(['asc','desc']).default('desc'),
});

module.exports = { createAdmissionSchema, updateAdmissionSchema, updateStatusSchema, listAdmissionsQuerySchema };
