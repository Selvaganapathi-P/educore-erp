const { z } = require('zod');

const createExamSchema = z.object({
  academicYearId: z.string().min(1),
  name:        z.string().min(1).max(200),
  type:        z.enum(['unit_test','mid_term','final','quarterly','half_yearly','annual','mock','pre_board']).optional(),
  description: z.string().optional(),
  startDate:   z.string().regex(/^\d{4}-\d{2}-\d{2}/),
  endDate:     z.string().regex(/^\d{4}-\d{2}-\d{2}/),
});

const addScheduleSchema = z.object({
  classId:    z.string().min(1),
  subjectId:  z.string().optional(),
  subjectName:z.string().optional(),
  date:       z.string().regex(/^\d{4}-\d{2}-\d{2}/),
  startTime:  z.string().optional(),
  endTime:    z.string().optional(),
  maxMarks:   z.number().min(1),
  passMark:   z.number().min(0),
  roomNo:     z.string().optional(),
});

const enterMarksSchema = z.object({
  sectionId: z.string().min(1),
  entries: z.array(z.object({
    studentId:      z.string().min(1),
    userId:         z.string().optional(),
    rollNumber:     z.string().optional(),
    marksObtained:  z.number().min(0).optional(),
    isAbsent:       z.boolean().optional(),
    remarks:        z.string().optional(),
  })).min(1),
});

module.exports = { createExamSchema, addScheduleSchema, enterMarksSchema };
