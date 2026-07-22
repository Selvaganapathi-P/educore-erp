const { z } = require('zod');

const createStructureSchema = z.object({
  academicYearId: z.string().min(1),
  classId:        z.string().optional(),
  name:           z.string().min(1).max(200),
  description:    z.string().optional(),
  items: z.array(z.object({
    head:       z.string().min(1),
    amount:     z.number().min(0),
    frequency:  z.enum(['monthly','quarterly','half_yearly','annual','one_time']).optional(),
    isOptional: z.boolean().optional(),
  })).min(1),
});

const generateInvoicesSchema = z.object({
  feeStructureId: z.string().min(1),
  classId:        z.string().optional(),
  sectionId:      z.string().optional(),
  period:         z.string().min(1),
  dueDate:        z.string().regex(/^\d{4}-\d{2}-\d{2}/),
  academicYearId: z.string().optional(),
});

const recordPaymentSchema = z.object({
  amount:      z.number().min(1),
  paymentMode: z.enum(['cash','cheque','online','upi','dd','card']).optional(),
  paymentDate: z.string().optional(),
  reference:   z.string().optional(),
  remarks:     z.string().optional(),
});

const applyConcessionSchema = z.object({
  amount:   z.number().min(0),
  itemHead: z.string().optional(),
  note:     z.string().optional(),
});

module.exports = { createStructureSchema, generateInvoicesSchema, recordPaymentSchema, applyConcessionSchema };
