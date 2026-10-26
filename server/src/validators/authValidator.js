import { z } from 'zod';

export const memberLoginSchema = z.object({
  memberId: z.string().trim().min(3, 'Member ID is required'),
  password: z.string().min(4, 'Password must be at least 4 characters long'),
});

export const staffLoginSchema = z.object({
  email: z.string().trim().email('Valid email address is required'),
  password: z.string().min(4, 'Password must be at least 4 characters long'),
});

export const validateMemberLogin = (data) => memberLoginSchema.safeParse(data);
export const validateStaffLogin = (data) => staffLoginSchema.safeParse(data);

