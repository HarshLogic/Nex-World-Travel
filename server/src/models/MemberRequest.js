import mongoose from 'mongoose';

const memberRequestSchema = new mongoose.Schema(
  {
    requestReference: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      uppercase: true,
      index: true,
    },
    memberId: {
      type: String,
      required: true,
      trim: true,
      uppercase: true,
      index: true,
    },
    memberName: {
      type: String,
      required: true,
    },
    memberEmail: {
      type: String,
      required: true,
    },
    requestType: {
      type: String,
      required: true,
      enum: [
        'Personal Information Update',
        'Membership & Plan Inquiry',
        'Plan Upgrade / Change',
        'Payment & EMI Question',
        'Booking Assistance',
        'Benefits & Available Nights',
        'Other Support Enquiry',
      ],
      index: true,
    },
    subject: {
      type: String,
      required: true,
      trim: true,
    },
    message: {
      type: String,
      required: true,
      trim: true,
    },
    status: {
      type: String,
      required: true,
      enum: [
        'Submitted',
        'Under Review',
        'Awaiting Member Information',
        'Approved',
        'Rejected',
        'Resolved',
      ],
      default: 'Submitted',
      index: true,
    },
    responseDeadline: {
      type: Date,
      required: true,
      default: () => new Date(Date.now() + 24 * 60 * 60 * 1000), // 24-hour SLA
      index: true,
    },
    internalNotes: [
      {
        note: { type: String, required: true },
        author: { type: String, required: true },
        createdAt: { type: Date, default: Date.now },
      },
    ],
    resolvedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

export const MemberRequest = mongoose.model('MemberRequest', memberRequestSchema);

