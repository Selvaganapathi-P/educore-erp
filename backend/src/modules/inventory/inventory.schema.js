const { z } = require('zod');

const createItemSchema = z.object({
  name:         z.string().min(1).max(120),
  code:         z.string().max(40).optional(),
  category:     z.enum(['stationery','furniture','electronics','lab','sports','cleaning','medical','uniform','other']).optional(),
  unit:         z.string().max(20).optional(),
  minStock:     z.number().min(0).optional(),
  unitPrice:    z.number().min(0).optional(),
  location:     z.string().max(100).optional(),
  description:  z.string().max(500).optional(),
});

const updateItemSchema = createItemSchema.partial();

const stockMovementSchema = z.object({
  itemId:        z.string().min(1),
  type:          z.enum(['purchase','issue','return','adjustment_in','adjustment_out']),
  quantity:      z.number().int().min(1),
  issuedToId:    z.string().optional(),
  issuedToModel: z.enum(['Student','Staff']).optional(),
  reference:     z.string().max(100).optional(),
  notes:         z.string().max(500).optional(),
  movedAt:       z.string().optional(),
});

module.exports = { createItemSchema, updateItemSchema, stockMovementSchema };
