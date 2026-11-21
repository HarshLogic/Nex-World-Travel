import mongoose from 'mongoose';

const packageSchema = new mongoose.Schema(
  {
    _id: { type: mongoose.Schema.Types.Mixed },
    title: { type: String, required: true, trim: true, index: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    destination: { type: String, required: true, trim: true },
    region: { type: String, required: true, trim: true, index: true },
    durationDays: { type: Number, required: true },
    durationNights: { type: Number, required: true },
    tagline: { type: String, default: '' },
    overview: { type: String, default: '' },
    includes: [{ type: String }],
    itinerarySummary: [{ day: Number, title: String, description: String }],
    priceEstimateNote: { type: String, default: 'Custom quotation based on departure date & preferences' },
    price: { type: Number, default: 0 },
    coverImage: { type: String, default: '' },
    imageUrl: { type: String, default: '/images/hero.jpg' },
    image: {
      data: { type: Buffer, select: false },
      contentType: { type: String, default: '' },
      originalName: { type: String, default: '' },
      size: { type: Number, default: 0 },
    },
    hasDirectImage: { type: Boolean, default: false, index: true },
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
packageSchema.pre('save', function (next) {
  if (this.hasDirectImage) {
    const directPath = `/api/v1/packages/${this.slug || this._id}/image`;
    if (!this.imageUrl || this.imageUrl.startsWith('/uploads/')) {
      this.imageUrl = directPath;
    }
    if (!this.coverImage || this.coverImage.startsWith('/uploads/')) {
      this.coverImage = directPath;
    }
  }
  if (!this.coverImage && this.imageUrl) this.coverImage = this.imageUrl;
  if (!this.imageUrl && this.coverImage) this.imageUrl = this.coverImage;
  next();
});

export const Package = mongoose.model('Package', packageSchema);
