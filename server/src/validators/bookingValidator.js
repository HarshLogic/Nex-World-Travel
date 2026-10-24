import { z } from 'zod';

export const bookingSchema = z.object({
  prefix: z.enum(['Mr.', 'Mrs.', 'Ms.', 'Mx.', 'Miss', 'Dr.', 'Prof.']).default('Mr.'),
  firstName: z.string().trim().min(2, 'First name is required (minimum 2 characters)'),
  middleName: z.string().trim().optional().default(''),
  lastName: z.string().trim().min(2, 'Last name is required (minimum 2 characters)'),
  email: z.string().trim().email('Please provide a valid email address'),
  phone: z.string().trim().min(6, 'Please provide a valid contact number (minimum 6 digits)'),
  streetAddress: z.string().trim().min(3, 'Street address is required'),
  stateProvince: z.string().trim().min(2, 'State or province is required'),
  nationality: z.string().trim().min(2, 'Nationality is required'),
  destinationOrPackage: z.string().trim().min(2, 'Please select or enter a destination or package'),
  travelDate: z.string().trim().min(4, 'Travel date is required'),
  returnDate: z.string().trim().optional().default(''),
  adults: z.coerce.number().int().min(1, 'At least 1 adult is required'),
  children: z.coerce.number().int().min(0, 'Children cannot be negative').default(0),
  activitiesRequired: z.string().trim().min(2, 'Please indicate your requested activities or preferences'),
  budgetRange: z.string().trim().optional().default('Flexible'),
  notes: z.string().trim().optional().default(''),
  consent: z.literal(true, {
    errorMap: () => ({ message: 'You must agree to the terms & conditions of Nex World Travel & Tourism' }),
  }),
});

export const validateBooking = (data) => {
  return bookingSchema.safeParse(data);
};

