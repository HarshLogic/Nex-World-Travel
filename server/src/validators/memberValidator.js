import { z } from 'zod';

const createMemberBase = z.object({
  memberId: z
    .string({ required_error: 'Member ID is required (e.g. NEX-M-2001)' })
    .trim()
    .min(3, 'Member ID must be at least 3 characters (e.g. NEX-M-2001)')
    .toUpperCase(),
  registeredName: z
    .string({ required_error: 'Member name is required' })
    .trim()
    .min(2, 'Full name must be at least 2 characters long'),
  email: z
    .string({ required_error: 'Valid email address is required' })
    .trim()
    .email('Please enter a valid email address (e.g. name@example.com)')
    .toLowerCase(),
  phone: z.string().trim().optional().default(''),
  initialPassword: z
    .string()
    .min(4, 'Password must be at least 4 characters')
    .default('Member123!'),
  packageType: z
    .enum(['Titanium', 'Platinum+', 'Platinum', 'Gold Plus', 'Gold', 'Silver Plus', 'Silver'])
    .default('Gold'),
  availableNights: z.coerce.number().min(0, 'Available nights cannot be negative').default(14),
  extraOffers: z.string().trim().optional().default('VIP Airport Meet & Assist + Lounge Access'),
  tenurePeriod: z.string().trim().default('3 Years'),
  travelCardBenefit: z.boolean().default(true),
  purchaseDate: z.string().optional(),
  productPrice: z.coerce.number().min(0, 'Product price must be non-negative').default(12500),
  initialPaidAmount: z.coerce.number().min(0, 'Initial paid amount cannot be negative').default(0),
  hasEMI: z.boolean().default(false),
  emiAmount: z.coerce.number().min(0).default(0),
  emiTenureMonths: z.coerce.number().min(0).default(12),
  nextEMIDueDate: z.string().optional().nullable(),
  membershipStatus: z
    .enum(['Open', 'Close', 'Deactive', 'Cancel', 'Active', 'Expired', 'Suspended', 'Pending'])
    .default('Open'),
});

export const createMemberSchema = z.preprocess((raw) => {
  if (!raw || typeof raw !== 'object') return {};
  const data = { ...raw };

  // Map 'name' -> 'registeredName'
  if (!data.registeredName && data.name) {
    data.registeredName = data.name;
  }

  // Normalize membership status
  if (data.membershipStatus) {
    const s = String(data.membershipStatus).trim().toLowerCase();
    if (s === 'open' || s === 'active') data.membershipStatus = 'Open';
    else if (s === 'close' || s === 'closed') data.membershipStatus = 'Close';
    else if (s === 'deactive' || s === 'deactivated' || s === 'suspended') data.membershipStatus = 'Deactive';
    else if (s === 'cancel' || s === 'cancelled' || s === 'expired') data.membershipStatus = 'Cancel';
  } else {
    data.membershipStatus = 'Open';
  }

  // Map 'password' -> 'initialPassword'
  if (!data.initialPassword && data.password) {
    data.initialPassword = data.password;
  }
  // Auto-default password if left empty
  if (!data.initialPassword || String(data.initialPassword).trim() === '') {
    data.initialPassword = 'Member123!';
  }

  // Map 'nightsAvailable' -> 'availableNights'
  if (data.availableNights === undefined && data.nightsAvailable !== undefined) {
    data.availableNights = data.nightsAvailable;
  }

  // Map nested emiDetails -> flat hasEMI, emiAmount, etc.
  if (data.emiDetails && typeof data.emiDetails === 'object') {
    if (data.hasEMI === undefined) data.hasEMI = Boolean(data.emiDetails.hasEmi);
    if (data.emiAmount === undefined) data.emiAmount = data.emiDetails.emiAmount;
    if (data.nextEMIDueDate === undefined) data.nextEMIDueDate = data.emiDetails.nextDueDate;
    if (data.emiTenureMonths === undefined) data.emiTenureMonths = data.emiDetails.tenureMonths || 12;
  }
  if (data.hasEmi !== undefined && data.hasEMI === undefined) {
    data.hasEMI = Boolean(data.hasEmi);
  }

  // Normalize package type casing
  if (typeof data.packageType === 'string') {
    const p = data.packageType.trim().toLowerCase();
    if (p === 'titanium') data.packageType = 'Titanium';
    else if (p === 'platinum+' || p === 'platinum plus') data.packageType = 'Platinum+';
    else if (p === 'platinum') data.packageType = 'Platinum';
    else if (p === 'gold plus' || p === 'gold+') data.packageType = 'Gold Plus';
    else if (p === 'gold') data.packageType = 'Gold';
    else if (p === 'silver plus' || p === 'silver+') data.packageType = 'Silver Plus';
    else if (p === 'silver') data.packageType = 'Silver';
  }

  return data;
}, createMemberBase);

export const updateMemberSchema = z.object({
  registeredName: z.string().trim().min(2).optional(),
  name: z.string().trim().min(2).optional(),
  email: z.string().trim().email().toLowerCase().optional(),
  phone: z.string().trim().optional(),
  packageType: z
    .enum(['Titanium', 'Platinum+', 'Platinum', 'Gold Plus', 'Gold', 'Silver Plus', 'Silver'])
    .optional(),
  availableNights: z.coerce.number().min(0).optional(),
  nightsAvailable: z.coerce.number().min(0).optional(),
  extraOffers: z.string().trim().optional(),
  tenurePeriod: z.string().trim().optional(),
  travelCardBenefit: z.boolean().optional(),
  purchaseDate: z.string().optional(),
  productPrice: z.coerce.number().min(0).optional(),
  hasEMI: z.boolean().optional(),
  emiAmount: z.coerce.number().min(0).optional(),
  emiTenureMonths: z.coerce.number().min(0).optional(),
  nextEMIDueDate: z.string().optional(),
  membershipStatus: z
    .enum(['Open', 'Close', 'Deactive', 'Cancel', 'Active', 'Expired', 'Suspended', 'Pending'])
    .optional(),
  status: z
    .enum(['Open', 'Close', 'Deactive', 'Cancel', 'Active', 'Expired', 'Suspended', 'Pending'])
    .optional(),
  reason: z.string().trim().optional(),
});

export const recordPaymentSchema = z.object({
  amount: z.coerce.number().positive('Payment amount must be greater than zero'),
  membershipStatus: z
    .enum(['Open', 'Close', 'Deactive', 'Cancel', 'Active', 'Expired', 'Suspended', 'Pending'])
    .optional(),
  paymentType: z.enum(['down_payment', 'emi_installment', 'lump_sum', 'adjustment', 'refund']).default('emi_installment'),
  paymentMethod: z
    .enum([
      'Bank Transfer',
      'Credit Card',
      'Debit Card',
      'Cheque',
      'Cash',
      'Tabby',
      'Tamara',
      'POS Swipe',
      'Account Adjustment',
    ])
    .default('Bank Transfer'),
  referenceNumber: z.string().trim().optional().default(''),
  notes: z.string().trim().optional().default(''),
  customDueDate: z.string().optional(),
});

export const validateCreateMember = (data) => createMemberSchema.safeParse(data);
export const validateUpdateMember = (data) => updateMemberSchema.safeParse(data);
export const validateRecordPayment = (data) => recordPaymentSchema.safeParse(data);
