import mongoose from 'mongoose';

const activitySchema = new mongoose.Schema(
  {
    _id: { type: mongoose.Schema.Types.Mixed },
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    category: {
      type: String,
      required: true,
      default: 'Desert & Safari',
    },
    region: { type: String, required: true, default: 'Middle East / UAE' },
    location: { type: String, required: true },
    shortDescription: { type: String, default: '' },
    description: { type: String, required: true },
    duration: { type: String, default: 'Flexible' },
    intensity: {
      type: String,
      enum: ['Easy', 'Moderate', 'High', 'All Ages'],
      default: 'Moderate',
    },
    imageUrl: { type: String, required: true, default: '/images/hero/hero-bg.jpg' },
    coverImage: { type: String, default: '' },
    highlights: [{ type: String }],
    displayOrder: { type: Number, default: 0 },
    featured: { type: Boolean, default: false },
    publicationStatus: {
      type: String,
      enum: ['published', 'draft', 'archived'],
      default: 'published',
      index: true,
    },
    isDeleted: { type: Boolean, default: false, index: true },
    createdBy: { type: String, default: 'Master Head' },
    updatedBy: { type: String, default: 'Master Head' },
  },
  { timestamps: true }
);

// Fallback coverImage <-> imageUrl and shortDescription
activitySchema.pre('save', function (next) {
  if (!this.coverImage && this.imageUrl) this.coverImage = this.imageUrl;
  if (!this.imageUrl && this.coverImage) this.imageUrl = this.coverImage;
  if (!this.shortDescription && this.description) {
    this.shortDescription = this.description.length > 140 ? `${this.description.slice(0, 137)}...` : this.description;
  }
  next();
});

export const Activity = mongoose.model('Activity', activitySchema);

