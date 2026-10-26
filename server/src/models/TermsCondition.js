import mongoose from 'mongoose';

const termsConditionSchema = new mongoose.Schema(
  {
    version: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    title: {
      type: String,
      required: true,
      default: 'Nexworld Travel & Tourism — Membership Terms & Conditions',
    },
    content: {
      type: String,
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    updatedBy: {
      type: String,
      default: 'Master Head',
    },
  },
  { timestamps: true }
);

export const TermsCondition = mongoose.model('TermsCondition', termsConditionSchema);

