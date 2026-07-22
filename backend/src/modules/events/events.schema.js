const { z } = require('zod');

const createEventSchema = z.object({
  title:          z.string().min(1).max(200),
  description:    z.string().max(2000).optional(),
  type:           z.enum(['academic','sports','cultural','holiday','meeting','exam','workshop','trip','other']).optional(),
  startDate:      z.string().min(1),
  endDate:        z.string().optional(),
  venue:          z.string().max(200).optional(),
  targetAudience: z.enum(['all','students','staff','parents','classes']).optional(),
  targetClasses:  z.array(z.string()).optional(),
  isPublished:    z.boolean().optional(),
});

const updateEventSchema  = createEventSchema.partial();

const issueCertSchema = z.object({
  type:           z.enum(['bonafide','character','transfer','participation','merit','experience','other']),
  recipientId:    z.string().min(1),
  recipientModel: z.enum(['Student','Staff']),
  academicYearId: z.string().optional(),
  issuedDate:     z.string().optional(),
  purpose:        z.string().max(500).optional(),
  details:        z.record(z.unknown()).optional(),
  status:         z.enum(['draft','issued']).optional(),
});

module.exports = { createEventSchema, updateEventSchema, issueCertSchema };
