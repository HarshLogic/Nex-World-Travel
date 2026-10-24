import { z } from 'zod';

export const contactSchema = z.object({
  fullName: z.string().trim().min(2, 'Full name is required (minimum 2 characters)'),
  email: z.string().trim().email('Please enter a valid email address'),
  phone: z.string().trim().optional().default(''),
  subject: z.string().trim().min(3, 'Subject must be at least 3 characters'),
  message: z.string().trim().min(10, 'Message must be at least 10 characters long'),
});

export const validateContact = (data) => {
  return contactSchema.safeParse(data);
};
