import mongoose from 'mongoose';

const destinationSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    region: {
      type: String,
      required: true,
      enum: ['Asia', 'Europe', 'Africa', 'Australia', 'Middle East / UAE'],
    },
    tagline: { type: String, required: true },
    description: { type: String, required: true },
    highlights: [{ type: String }],
    popularCities: [{ type: String }],
    bestTimeToVisit: { type: String },
    featured: { type: Boolean, default: false },
    imageUrl: { type: String, required: true },
    curatedActivities: [{ type: String }],
  },
  { timestamps: true }
);

export const Destination = mongoose.model('Destination', destinationSchema);

