import mongoose from 'mongoose';

const destinationSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true, index: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    countryOrRegion: { type: String, default: '' },
    region: {
      type: String,
      required: true,
      enum: ['Asia', 'Europe', 'Africa', 'Australia', 'Middle East / UAE'],
      index: true,
    },
    category: {
      type: String,
      required: true,
      enum: ['Dream Destinations', 'Top Destinations'],
      default: 'Top Destinations',
      index: true,
    },
    tagline: { type: String, default: '' },
    shortDescription: { type: String, default: '' },
    description: { type: String, required: true },
    coverImage: { type: String, default: '' },
    imageUrl: { type: String, default: '' },
    additionalImages: [{ type: String }],
    highlights: [{ type: String }],
    popularCities: [{ type: String }],
    bestTimeToVisit: { type: String, default: 'Year Round' },
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

// Fallback coverImage <-> imageUrl
destinationSchema.pre('save', function (next) {
  if (!this.coverImage && this.imageUrl) this.coverImage = this.imageUrl;
  if (!this.imageUrl && this.coverImage) this.imageUrl = this.coverImage;
  if (!this.shortDescription && this.tagline) this.shortDescription = this.tagline;
  next();
});

export const Destination = mongoose.model('Destination', destinationSchema);
