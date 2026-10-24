import mongoose from 'mongoose';

const packageSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    destination: { type: String, required: true },
    region: { type: String, required: true },
    durationDays: { type: Number, required: true },
    durationNights: { type: Number, required: true },
    tagline: { type: String, required: true },
    overview: { type: String, required: true },
    includes: [{ type: String }],
    itinerarySummary: [{ day: Number, title: String, description: String }],
    priceEstimateNote: { type: String, default: 'Custom quotation based on departure date & preferences' },
    imageUrl: { type: String, required: true },
    featured: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export const Package = mongoose.model('Package', packageSchema);

