const { z } = require('zod');

const createAnnouncementSchema = z.object({
  title:          z.string().min(2).max(200),
  content:        z.string().min(5),
  type:           z.enum(['general','event','urgent','holiday','exam','fee']).optional(),
  targetAudience: z.enum(['all','roles','classes']).optional(),
  targetRoles:    z.array(z.string()).optional(),
  targetClasses:  z.array(z.string()).optional(),
  isPublished:    z.boolean().optional(),
  expiresAt:      z.string().optional(),
  attachments:    z.array(z.object({ name: z.string(), url: z.string(), type: z.string() })).optional(),
});

const sendMessageSchema = z.object({
  toUserId: z.string().min(1),
  subject:  z.string().min(1).max(200),
  body:     z.string().min(1),
  parentId: z.string().optional(),
  threadId: z.string().optional(),
});

module.exports = { createAnnouncementSchema, sendMessageSchema };
