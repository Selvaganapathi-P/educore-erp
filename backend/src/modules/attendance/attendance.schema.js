const { z } = require('zod');

const markStudentSchema = z.object({
  classId:        z.string().min(1),
  sectionId:      z.string().min(1),
  academicYearId: z.string().min(1),
  date:           z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  entries: z.array(z.object({
    studentId:   z.string().min(1),
    userId:      z.string().optional(),
    rollNumber:  z.string().optional(),
    status:      z.enum(['present','absent','late','leave','half_day']),
    lateMinutes: z.number().optional(),
    leaveType:   z.string().optional(),
    remark:      z.string().optional(),
  })).min(1),
});

const markStaffSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  entries: z.array(z.object({
    staffId:     z.string().min(1),
    userId:      z.string().optional(),
    status:      z.enum(['present','absent','late','leave','half_day','work_from_home']),
    checkIn:     z.string().optional(),
    checkOut:    z.string().optional(),
    lateMinutes: z.number().optional(),
    leaveType:   z.string().optional(),
    remark:      z.string().optional(),
  })).min(1),
});

module.exports = { markStudentSchema, markStaffSchema };
