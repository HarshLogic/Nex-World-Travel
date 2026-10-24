import mongoose from 'mongoose';

const activitySchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    category: {
      type: String,
      required: true,
      enum: [
        'Adventure & Adrenaline',
        'Cultural & Heritage',
        'Water Sports & Marine',
        'Theme Parks & Attractions',
        'Desert & Safari',
        'Wellness & Relaxation',
      ],
    },
    region: { type: String, required: true },
    location: { type: String, required: true },
    description: { type: String, required: true },
    duration: { type: String, default: 'Flexible' },
    intensity: {
      type: String,
      enum: ['Easy', 'Moderate', 'High', 'All Ages'],
      default: 'Moderate',
    },
    imageUrl: { type: String, required: true },
    highlights: [{ type: String }],
    featured: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export const Activity = mongoose.model('Activity', activitySchema);

