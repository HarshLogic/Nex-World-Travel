import { z } from 'zod';

export const memberRequestSchema = z.object({
  requestType: z.enum([
    'Personal Information Update',
    'Membership & Plan Inquiry',
    'Plan Upgrade / Change',
    'Payment & EMI Question',
    'Booking Assistance',
    'Benefits & Available Nights',
    'Other Support Enquiry',
  ]),
  subject: z.string().trim().min(3, 'Subject must be at least 3 characters long'),
  message: z.string().trim().min(10, 'Message must be at least 10 characters long'),
});

export const employeeChangeRequestSchema = z.object({
  entityType: z.enum(['member_details', 'membership_plan', 'financial', 'destination']),
  targetId: z.string().trim().min(1, 'Target ID is required'),
  targetName: z.string().trim().optional(),
  currentValue: z.any(),
  proposedValue: z.any(),
  reason: z.string().trim().min(5, 'A clear reason for the requested change is required (minimum 5 characters)'),
});

export const validateMemberRequest = (data) => memberRequestSchema.safeParse(data);
export const validateEmployeeChangeRequest = (data) => employeeChangeRequestSchema.safeParse(data);

