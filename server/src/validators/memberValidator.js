import { z } from 'zod';

export const createMemberSchema = z.object({
  memberId: z.string().trim().min(3, 'Member ID is required (e.g. NEX-M-1001)').toUpperCase(),
  registeredName: z.string().trim().min(2, 'Registered name is required'),
  email: z.string().trim().email('Valid email address is required').toLowerCase(),
  phone: z.string().trim().min(6, 'Valid contact number is required'),
  initialPassword: z.string().min(6, 'Initial password must be at least 6 characters long'),
  packageType: z.enum(['Gold', 'Silver']).default('Silver'),
  availableNights: z.coerce.number().min(0, 'Available nights cannot be negative').default(7),
  extraOffers: z.string().trim().optional().default('Complimentary airport VIP meet & greet'),
  tenurePeriod: z.string().trim().min(1, 'Tenure period is required (e.g. 5 Years)').default('5 Years'),
  travelCardBenefit: z.boolean().default(false),
  purchaseDate: z.string().optional(),
  productPrice: z.coerce.number().min(0, 'Product price must be non-negative'),
  initialPaidAmount: z.coerce.number().min(0, 'Initial paid amount cannot be negative').default(0),
  hasEMI: z.boolean().default(false),
  emiAmount: z.coerce.number().min(0).default(0),
  emiTenureMonths: z.coerce.number().min(0).default(0),
  nextEMIDueDate: z.string().optional(),
  membershipStatus: z.enum(['Active', 'Expired', 'Suspended', 'Pending']).default('Active'),
});

export const updateMemberSchema = z.object({
  registeredName: z.string().trim().min(2).optional(),
  email: z.string().trim().email().toLowerCase().optional(),
  phone: z.string().trim().optional(),
  packageType: z.enum(['Gold', 'Silver']).optional(),
  availableNights: z.coerce.number().min(0).optional(),
  extraOffers: z.string().trim().optional(),
  tenurePeriod: z.string().trim().optional(),
  travelCardBenefit: z.boolean().optional(),
  purchaseDate: z.string().optional(),
  productPrice: z.coerce.number().min(0).optional(),
  hasEMI: z.boolean().optional(),
  emiAmount: z.coerce.number().min(0).optional(),
  emiTenureMonths: z.coerce.number().min(0).optional(),
  nextEMIDueDate: z.string().optional(),
  membershipStatus: z.enum(['Active', 'Expired', 'Suspended', 'Pending']).optional(),
  reason: z.string().trim().optional(),
});

export const recordPaymentSchema = z.object({
  amount: z.coerce.number().positive('Payment amount must be greater than zero'),
  paymentType: z.enum(['down_payment', 'emi_installment', 'lump_sum', 'adjustment', 'refund']).default('emi_installment'),
  paymentMethod: z.enum(['Bank Transfer', 'Credit Card', 'Debit Card', 'Cheque', 'Cash', 'Account Adjustment']).default('Bank Transfer'),
  referenceNumber: z.string().trim().optional().default(''),
  notes: z.string().trim().optional().default(''),
  customDueDate: z.string().optional(),
});

export const validateCreateMember = (data) => createMemberSchema.safeParse(data);
export const validateUpdateMember = (data) => updateMemberSchema.safeParse(data);
export const validateRecordPayment = (data) => recordPaymentSchema.safeParse(data);

