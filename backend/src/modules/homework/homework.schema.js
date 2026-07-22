const { z } = require('zod');

const createHomeworkSchema = z.object({
  academicYearId:      z.string().min(1),
  classId:             z.string().min(1),
  sectionId:           z.string().optional(),
  subjectId:           z.string().optional(),
  title:               z.string().min(1).max(250),
  description:         z.string().optional(),
  instructions:        z.string().optional(),
  dueDate:             z.string().regex(/^\d{4}-\d{2}-\d{2}/),
  type:                z.enum(['homework','assignment','project','classwork']).optional(),
  maxMarks:            z.number().min(0).optional(),
  allowLateSubmission: z.boolean().optional(),
  latePenaltyPct:      z.number().min(0).max(100).optional(),
});

const submitSchema = z.object({
  content:     z.string().optional(),
  attachments: z.array(z.object({ name: z.string(), url: z.string(), type: z.string() })).optional(),
});

const gradeSchema = z.object({
  grade:    z.number().min(0),
  feedback: z.string().optional(),
});

module.exports = { createHomeworkSchema, submitSchema, gradeSchema };
