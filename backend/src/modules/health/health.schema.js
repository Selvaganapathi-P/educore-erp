const { z } = require('zod');

const BLOOD_GROUPS = ['A+','A-','B+','B-','AB+','AB-','O+','O-','unknown'];

const upsertHealthRecordSchema = z.object({
  memberId:    z.string().min(1),
  memberModel: z.enum(['Student','Staff']),
  bloodGroup:         z.enum(BLOOD_GROUPS).optional(),
  heightCm:           z.number().positive().optional(),
  weightKg:           z.number().positive().optional(),
  allergies:          z.array(z.string()).optional(),
  chronicConditions:  z.array(z.string()).optional(),
  disabilities:       z.array(z.string()).optional(),
  emergencyContactName:     z.string().max(100).optional(),
  emergencyContactPhone:    z.string().max(20).optional(),
  emergencyContactRelation: z.string().max(50).optional(),
  insuranceProvider: z.string().max(100).optional(),
  insurancePolicyNo: z.string().max(60).optional(),
  notes:             z.string().max(1000).optional(),
});

const prescriptionSchema = z.object({
  medicine: z.string().min(1),
  dosage:   z.string().optional(),
  duration: z.string().optional(),
});

const createVisitSchema = z.object({
  memberId:      z.string().min(1),
  memberModel:   z.enum(['Student','Staff']),
  visitDate:     z.string().optional(),
  complaint:     z.string().min(1).max(500),
  diagnosis:     z.string().max(500).optional(),
  treatment:     z.string().max(500).optional(),
  prescriptions: z.array(prescriptionSchema).optional(),
  temperatureF:  z.number().optional(),
  bp:            z.string().max(20).optional(),
  pulseRate:     z.number().optional(),
  followUpDate:  z.string().optional(),
  notes:         z.string().max(1000).optional(),
});

const updateVisitSchema = createVisitSchema.omit({ memberId: true, memberModel: true }).partial();

module.exports = { upsertHealthRecordSchema, createVisitSchema, updateVisitSchema };
