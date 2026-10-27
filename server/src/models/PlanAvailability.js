import mongoose from 'mongoose';

const planAvailabilitySchema = new mongoose.Schema(
  {
    _id: {
      type: mongoose.Schema.Types.Mixed,
    },
    memberId: {
      type: String,
      default: 'ALL',
      trim: true,
      uppercase: true,
      index: true,
    },
    memberName: {
      type: String,
      default: 'All Members',
      trim: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    destinationOrPlan: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    packageTier: {
      type: String,
      enum: ['All', 'Titanium', 'Platinum+', 'Platinum', 'Gold Plus', 'Gold', 'Silver Plus', 'Silver'],
      default: 'All',
      index: true,
    },
    startDate: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    endDate: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    isAvailable: {
      type: Boolean,
      default: true,
      index: true,
    },
    availableSeats: {
      type: Number,
      default: 10,
      min: 0,
    },
    bookedSeats: {
      type: Number,
      default: 0,
      min: 0,
    },
    notes: {
      type: String,
      trim: true,
      default: '',
    },
    createdBy: {
      type: String,
      trim: true,
      default: 'Master Administrator',
    },
  },
  { timestamps: true }
);

export const PlanAvailability =
  mongoose.models.PlanAvailability || mongoose.model('PlanAvailability', planAvailabilitySchema);

