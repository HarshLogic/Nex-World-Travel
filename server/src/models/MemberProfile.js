import mongoose from 'mongoose';

const memberProfileSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    memberId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      uppercase: true,
      index: true,
    },
    registeredName: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      index: true,
    },
    phone: {
      type: String,
      trim: true,
      default: '',
    },
    packageType: {
      type: String,
      required: true,
      enum: ['Gold', 'Silver'],
      default: 'Silver',
      index: true,
    },
    availableNights: {
      type: Number,
      required: true,
      default: 7,
      min: 0,
    },
    extraOffers: {
      type: String,
      default: 'Complimentary airport VIP meet & greet and 10% curated dining privilege.',
      trim: true,
    },
    tenurePeriod: {
      type: String,
      required: true,
      default: '5 Years',
      trim: true,
    },
    travelCardBenefit: {
      type: Boolean,
      required: true,
      default: false,
    },
    purchaseDate: {
      type: Date,
      required: true,
      default: Date.now,
    },
    productPrice: {
      type: Number,
      required: true,
      min: 0,
    },
    totalAmountPaid: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },
    outstandingBalance: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },
    // EMI specifications
    hasEMI: {
      type: Boolean,
      default: false,
    },
    emiAmount: {
      type: Number,
      default: 0,
      min: 0,
    },
    emiTenureMonths: {
      type: Number,
      default: 0,
      min: 0,
    },
    emiPaidMonths: {
      type: Number,
      default: 0,
      min: 0,
    },
    nextEMIDueDate: {
      type: Date,
      default: null,
    },
    dueAmount: {
      type: Number,
      default: 0,
      min: 0,
    },
    paymentStatus: {
      type: String,
      enum: ['Up to Date', 'Due Soon', 'Overdue', 'Fully Paid'],
      default: 'Up to Date',
      index: true,
    },
    membershipStatus: {
      type: String,
      enum: ['Active', 'Expired', 'Suspended', 'Pending'],
      default: 'Active',
      index: true,
    },
    // Terms & Conditions Acknowledgement
    termsAccepted: {
      type: Boolean,
      default: false,
    },
    termsAcceptedAt: {
      type: Date,
      default: null,
    },
    termsVersion: {
      type: String,
      default: 'v1.0-2026',
    },
  },
  { timestamps: true }
);

// Compound text search index for fast 5,000 member lookups
memberProfileSchema.index({
  memberId: 'text',
  registeredName: 'text',
  email: 'text',
  phone: 'text',
});

export const MemberProfile = mongoose.model('MemberProfile', memberProfileSchema);

