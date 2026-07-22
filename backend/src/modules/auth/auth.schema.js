const { z } = require('zod');

const passwordRule = z
  .string()
  .min(8, 'At least 8 characters')
  .regex(/[A-Z]/, 'Must contain an uppercase letter')
  .regex(/[a-z]/, 'Must contain a lowercase letter')
  .regex(/[0-9]/, 'Must contain a number')
  .regex(/[^A-Za-z0-9]/, 'Must contain a special character');

const loginSchema = z.object({
  email:      z.string().email('Invalid email').toLowerCase().trim(),
  password:   z.string().min(1, 'Password is required'),
  rememberMe: z.boolean().optional(),
});

const forgotPasswordSchema = z.object({
  email: z.string().email('Invalid email').toLowerCase().trim(),
});

const resetPasswordSchema = z.object({
  token:           z.string().min(1, 'Token is required'),
  password:        passwordRule,
  confirmPassword: z.string(),
}).refine((d) => d.password === d.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword:     passwordRule,
  confirmPassword: z.string(),
}).refine((d) => d.newPassword === d.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

module.exports = { loginSchema, forgotPasswordSchema, resetPasswordSchema, changePasswordSchema };
