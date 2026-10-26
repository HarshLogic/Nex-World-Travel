import mongoose from 'mongoose';

const employeeChangeRequestSchema = new mongoose.Schema(
  {
    requestId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      uppercase: true,
      index: true,
    },
    employeeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    employeeName: {
      type: String,
      required: true,
    },
    employeeEmail: {
      type: String,
      required: true,
    },
    entityType: {
      type: String,
      required: true,
      enum: ['member_details', 'membership_plan', 'financial', 'destination'],
      index: true,
    },
    targetId: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    targetName: {
      type: String,
      default: '',
    },
    currentValue: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
    },
    proposedValue: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
    },
    reason: {
      type: String,
      required: true,
      trim: true,
    },
    status: {
      type: String,
      required: true,
      enum: ['Pending', 'Approved', 'Rejected'],
      default: 'Pending',
      index: true,
    },
    reviewedBy: {
      type: String,
      default: null,
    },
    reviewedAt: {
      type: Date,
      default: null,
    },
    reviewNotes: {
      type: String,
      default: '',
    },
  },
  { timestamps: true }
);

export const EmployeeChangeRequest = mongoose.model(
  'EmployeeChangeRequest',
  employeeChangeRequestSchema
);

