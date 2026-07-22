const { z } = require('zod');

const stopSchema = z.object({
  name:       z.string().min(1),
  order:      z.number().int().min(1),
  pickupTime: z.string().optional(),
  dropTime:   z.string().optional(),
  distanceKm: z.number().min(0).optional(),
  fare:       z.number().min(0).optional(),
});

const createVehicleSchema = z.object({
  registrationNo:  z.string().min(1),
  vehicleType:     z.enum(['bus','van','auto','tempo']).optional(),
  model:           z.string().optional(),
  capacity:        z.number().int().min(1),
  color:           z.string().optional(),
  driverId:        z.string().optional(),
  conductorId:     z.string().optional(),
  routeId:         z.string().optional(),
  insuranceExpiry: z.string().optional(),
  pucExpiry:       z.string().optional(),
  fitnessExpiry:   z.string().optional(),
  notes:           z.string().optional(),
});

const createRouteSchema = z.object({
  name:      z.string().min(1),
  vehicleId: z.string().optional(),
  stops:     z.array(stopSchema).min(1),
  notes:     z.string().optional(),
});

const assignStudentSchema = z.object({
  studentId:      z.string().min(1),
  routeId:        z.string().min(1),
  academicYearId: z.string().min(1),
  stopName:       z.string().min(1),
  transportType:  z.enum(['pickup','drop','both']).optional(),
  feeAmount:      z.number().min(0).optional(),
});

module.exports = { createVehicleSchema, createRouteSchema, assignStudentSchema };
