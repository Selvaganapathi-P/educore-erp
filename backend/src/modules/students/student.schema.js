const { z } = require('zod');

const createStudentSchema = z.object({
  userId:       z.string().min(1, 'userId required'),
  class:        z.string().min(1, 'Class required'),
  section:      z.string().default('A'),
  academicYear: z.string().min(1, 'Academic year required'),
  admissionId:  z.string().optional(),
  admissionNo:  z.string().optional(),
  feeCategory:  z.enum(['general','scholarship','staff_ward','ews','other']).default('general'),
  house:        z.string().optional(),
  medical: z.object({
    allergies:  z.array(z.string()).optional(),
    conditions: z.array(z.string()).optional(),
    doctorName: z.string().optional(),
    doctorPhone:z.string().optional(),
    height:     z.coerce.number().optional(),
    weight:     z.coerce.number().optional(),
  }).optional(),
  transport: z.object({
    enrolled:    z.boolean().optional(),
    routeNo:     z.string().optional(),
    vehicleNo:   z.string().optional(),
    pickupPoint: z.string().optional(),
  }).optional(),
  hostel: z.object({
    enrolled:    z.boolean().optional(),
    hostelName:  z.string().optional(),
    roomNo:      z.string().optional(),
    bedNo:       z.string().optional(),
  }).optional(),
});

const updateStudentSchema = createStudentSchema.omit({ userId: true }).partial();

const listStudentsQuerySchema = z.object({
  page:         z.coerce.number().int().positive().default(1),
  limit:        z.coerce.number().int().min(1).max(100).default(25),
  search:       z.string().optional(),
  class:        z.string().optional(),
  section:      z.string().optional(),
  academicYear: z.string().optional(),
  status:       z.string().optional(),
  sortBy:       z.enum(['createdAt','rollNumber']).default('rollNumber'),
  sortOrder:    z.enum(['asc','desc']).default('asc'),
});

module.exports = { createStudentSchema, updateStudentSchema, listStudentsQuerySchema };
