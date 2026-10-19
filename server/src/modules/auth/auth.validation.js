import { z } from 'zod';

export const registerSchema = z.object({
  body: z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(8, 'Password must be at least 8 characters long'),
    fullName: z.string().min(2, 'Full name is required'),
    role: z.enum(['FARMER', 'BUYER', 'AGRICULTURE_EXPERT'], {
      errorMap: () => ({ message: 'Role must be FARMER, BUYER, or AGRICULTURE_EXPERT' }),
    }),
    phone: z.string().optional(),
    state: z.string().optional().default('Maharashtra'),
    district: z.string().optional(),
    preferredLang: z.string().optional().default('en'),
    // Optional expert fields
    specialization: z.string().optional(),
    qualifications: z.string().optional(),
    experienceYears: z.number().int().optional(),
  }),
});

export const loginSchema = z.object({
  body: z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(1, 'Password is required'),
  }),
});

export const forgotPasswordSchema = z.object({
  body: z.object({
    email: z.string().email('Invalid email address'),
  }),
});

export const resetPasswordSchema = z.object({
  body: z.object({
    token: z.string().min(1, 'Reset token is required'),
    newPassword: z.string().min(8, 'New password must be at least 8 characters long'),
  }),
});
