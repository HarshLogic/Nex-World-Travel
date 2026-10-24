import mongoose from 'mongoose';

const bookingSchema = new mongoose.Schema(
  {
    enquiryNumber: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
    },
    prefix: {
      type: String,
      enum: ['Mr.', 'Mrs.', 'Ms.', 'Mx.', 'Miss', 'Dr.', 'Prof.'],
      default: 'Mr.',
    },
    firstName: { type: String, required: true, trim: true },
    middleName: { type: String, trim: true, default: '' },
    lastName: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true },
    phone: { type: String, required: true, trim: true },
    streetAddress: { type: String, required: true, trim: true },
    stateProvince: { type: String, required: true, trim: true },
    nationality: { type: String, required: true, trim: true },
    destinationOrPackage: { type: String, required: true, trim: true },
    travelDate: { type: String, required: true },
    returnDate: { type: String, default: '' },
    adults: { type: Number, required: true, min: 1, default: 1 },
    children: { type: Number, default: 0, min: 0 },
    activitiesRequired: { type: String, required: true, trim: true },
    budgetRange: { type: String, default: 'Flexible' },
    notes: { type: String, default: '' },
    consent: { type: Boolean, required: true, default: true },
    status: {
      type: String,
      enum: ['pending_review', 'in_consultation', 'itinerary_crafted', 'archived'],
      default: 'pending_review',
    },
  },
  { timestamps: true }
);

export const Booking = mongoose.model('Booking', bookingSchema);
