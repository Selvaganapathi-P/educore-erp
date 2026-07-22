const { z } = require('zod');

const createBookSchema = z.object({
  title:        z.string().min(1).max(300),
  author:       z.string().min(1).max(200),
  isbn:         z.string().optional(),
  category:     z.string().optional(),
  publisher:    z.string().optional(),
  edition:      z.string().optional(),
  language:     z.string().optional(),
  tags:         z.array(z.string()).optional(),
  coverImage:   z.string().optional(),
  location:     z.string().optional(),
  totalCopies:  z.number().int().min(0).default(1),
  description:  z.string().optional(),
});

const issueBookSchema = z.object({
  bookId:      z.string().min(1),
  memberId:    z.string().min(1),
  memberModel: z.enum(['Student','Staff']),
  dueDate:     z.string().optional(),
  finePerDay:  z.number().min(0).optional(),
  notes:       z.string().optional(),
});

const returnBookSchema = z.object({
  finePaid: z.boolean().optional(),
  notes:    z.string().optional(),
});

module.exports = { createBookSchema, issueBookSchema, returnBookSchema };
