import mongoose from 'mongoose';

const activitySchema = new mongoose.Schema(
  {
    _id: { type: mongoose.Schema.Types.Mixed },
    title: { type: String, required: true, trim: true, index: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    category: {
      type: String,
      required: true,
      default: 'Desert & Safari',
      index: true,
    },
    region: { type: String, required: true, default: 'Middle East / UAE', index: true },
    location: { type: String, required: true },
    shortDescription: { type: String, default: '' },
    description: { type: String, required: true },
    duration: { type: String, default: 'Flexible' },
    intensity: {
      type: String,
      enum: ['Easy', 'Moderate', 'High', 'All Ages'],
      default: 'Moderate',
    },
    imageUrl: { type: String, default: '/images/hero.jpg' },
    coverImage: { type: String, default: '' },
    image: {
      data: { type: Buffer, select: false },
      contentType: { type: String, default: '' },
      originalName: { type: String, default: '' },
      size: { type: Number, default: 0 },
    },
    hasDirectImage: { type: Boolean, default: false, index: true },
    highlights: [{ type: String }],
    displayOrder: { type: Number, default: 0 },
    featured: { type: Boolean, default: false, index: true },
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

// Fallback coverImage <-> imageUrl and direct image URL resolution
activitySchema.pre('save', function (next) {
  if (this.hasDirectImage) {
    const directPath = `/api/v1/activities/${this.slug || this._id}/image`;
    if (!this.imageUrl || this.imageUrl.startsWith('/uploads/')) {
      this.imageUrl = directPath;
    }
    if (!this.coverImage || this.coverImage.startsWith('/uploads/')) {
      this.coverImage = directPath;
    }
  }
  if (!this.coverImage && this.imageUrl) this.coverImage = this.imageUrl;
  if (!this.imageUrl && this.coverImage) this.imageUrl = this.coverImage;
  if (!this.shortDescription && this.description) {
    this.shortDescription =
      this.description.length > 140 ? `${this.description.slice(0, 137)}...` : this.description;
  }
  next();
});

export const Activity = mongoose.model('Activity', activitySchema);
