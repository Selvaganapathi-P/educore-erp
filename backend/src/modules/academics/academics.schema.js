const { z } = require('zod');

// Academic Year
const createAcademicYearSchema = z.object({
  name:      z.string().min(1, 'Name required').trim(),
  startDate: z.string().min(1, 'Start date required'),
  endDate:   z.string().min(1, 'End date required'),
  isCurrent: z.boolean().default(false),
});

const addHolidaySchema = z.object({
  name:     z.string().min(1, 'Holiday name required'),
  date:     z.string().min(1, 'Date required'),
  type:     z.enum(['national','religious','school','other']).default('school'),
  optional: z.boolean().default(false),
});

// Classes
const sectionInputSchema = z.object({
  name:     z.string().min(1, 'Section name required'),
  roomNo:   z.string().optional(),
  capacity: z.coerce.number().int().positive().default(40),
  classTeacher: z.string().optional(),
});

const createClassSchema = z.object({
  academicYearId: z.string().min(1, 'Academic year required'),
  name:           z.string().min(1, 'Class name required').trim(),
  displayOrder:   z.coerce.number().int().min(0).default(0),
  sections:       z.array(sectionInputSchema).min(1, 'At least one section required'),
});

const updateClassSchema = createClassSchema.omit({ academicYearId: true }).partial();

const addSectionSchema = sectionInputSchema;

// Subjects
const createSubjectSchema = z.object({
  academicYearId: z.string().min(1, 'Academic year required'),
  name:           z.string().min(1, 'Subject name required').trim(),
  code:           z.string().optional(),
  type:           z.enum(['theory','practical','both','activity']).default('theory'),
  isElective:     z.boolean().default(false),
  isMandatory:    z.boolean().default(true),
  creditHours:    z.coerce.number().default(1),
  color:          z.string().regex(/^#[0-9A-Fa-f]{6}$/).default('#3B82F6'),
  maxMarks:       z.coerce.number().default(100),
  passMarks:      z.coerce.number().default(33),
  classes: z.array(z.object({
    classId:        z.string(),
    teacherId:      z.string().optional(),
    periodsPerWeek: z.coerce.number().default(5),
  })).optional(),
});

const updateSubjectSchema = createSubjectSchema.omit({ academicYearId: true }).partial();

// Timetable
const periodInputSchema = z.object({
  periodNo:   z.coerce.number().int().positive(),
  startTime:  z.string().regex(/^\d{2}:\d{2}$/, 'HH:MM format'),
  endTime:    z.string().regex(/^\d{2}:\d{2}$/, 'HH:MM format'),
  subjectId:  z.string().optional(),
  teacherId:  z.string().optional(),
  roomNo:     z.string().optional(),
  isBreak:    z.boolean().default(false),
  breakLabel: z.string().optional(),
});

const saveTimetableSchema = z.object({
  classId:        z.string().min(1),
  sectionId:      z.string().optional(),
  sectionName:    z.string().optional(),
  academicYearId: z.string().min(1),
  effectiveFrom:  z.string().optional(),
  schedule: z.array(z.object({
    day:     z.coerce.number().int().min(0).max(6),
    periods: z.array(periodInputSchema),
  })),
});

module.exports = {
  createAcademicYearSchema, addHolidaySchema,
  createClassSchema, updateClassSchema, addSectionSchema,
  createSubjectSchema, updateSubjectSchema,
  saveTimetableSchema,
};
