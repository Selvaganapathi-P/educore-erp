const { z } = require('zod');

const createHostelSchema = z.object({
  name:         z.string().min(1).max(200),
  type:         z.enum(['boys','girls','co_ed']),
  wardenId:     z.string().optional(),
  address:      z.string().optional(),
  contactPhone: z.string().optional(),
  amenities:    z.array(z.string()).optional(),
});

const createRoomSchema = z.object({
  hostelId:   z.string().min(1),
  roomNumber: z.string().min(1),
  floor:      z.string().optional(),
  roomType:   z.enum(['single','double','triple','dormitory']).optional(),
  capacity:   z.number().int().min(1),
  monthlyFee: z.number().min(0).optional(),
  amenities:  z.array(z.string()).optional(),
  notes:      z.string().optional(),
});

const allotStudentSchema = z.object({
  studentId:      z.string().min(1),
  hostelId:       z.string().min(1),
  roomId:         z.string().min(1),
  academicYearId: z.string().min(1),
  bedNumber:      z.string().optional(),
  joinDate:       z.string().optional(),
  feeAmount:      z.number().min(0).optional(),
});

const vacateSchema = z.object({
  leaveDate:  z.string().optional(),
  leftReason: z.string().optional(),
});

module.exports = { createHostelSchema, createRoomSchema, allotStudentSchema, vacateSchema };
