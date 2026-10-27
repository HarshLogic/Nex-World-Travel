import mongoose from 'mongoose';

const bookingSchema = new mongoose.Schema(
  {
    enquiryNumber: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      index: true,
    },
    // Standard Booking Request Format Fields
    memberName: {
      type: String,
      trim: true,
      default: '',
    },
    spouseName: {
      type: String,
      trim: true,
      default: '',
    },
    kidsAges: {
      type: String,
      trim: true,
      default: '',
    },
    checkInDate: {
      type: String,
      trim: true,
      default: '',
    },
    checkOutDate: {
      type: String,
      trim: true,
      default: '',
    },
    guestsCount: {
      type: Number,
      default: 1,
      min: 1,
    },
    customerName: {
      type: String,
      trim: true,
      default: '',
    },
    prefix: {
      type: String,
      enum: ['Mr.', 'Mrs.', 'Ms.', 'Mx.', 'Miss', 'Dr.', 'Prof.'],
      default: 'Mr.',
    },
    firstName: { type: String, required: true, trim: true },
    middleName: { type: String, trim: true, default: '' },
    lastName: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true, index: true },
    phone: { type: String, required: true, trim: true },
    streetAddress: { type: String, required: true, trim: true },
    stateProvince: { type: String, required: true, trim: true },
    nationality: { type: String, required: true, trim: true },
    destinationOrPackage: { type: String, required: true, trim: true },
    travelDate: { type: String, required: true },
    returnDate: { type: String, default: '' },
    adults: { type: Number, required: true, min: 1, default: 1 },
    children: { type: Number, default: 0, min: 0 },
    numberOfNights: { type: Number, default: 7 },
    activitiesRequired: { type: String, required: true, trim: true },
    budgetRange: { type: String, default: 'Flexible' },
    notes: { type: String, default: '' },
    consent: { type: Boolean, required: true, default: true },
    status: {
      type: String,
      enum: [
        'New',
        'Contacted',
        'Awaiting Customer Response',
        'Awaiting Supplier Confirmation',
        'Confirmed',
        'Cancelled',
        'Completed',
      ],
      default: 'New',
      index: true,
    },
    internalNotes: [
      {
        note: { type: String, required: true },
        author: { type: String, required: true },
        createdAt: { type: Date, default: Date.now },
      },
    ],
    emailNotificationSent: {
      type: Boolean,
      default: false,
      index: true,
    },
    emailError: {
      type: String,
      default: '',
    },
  },
  { timestamps: true }
);

bookingSchema.pre('save', function (next) {
  if (!this.customerName) {
    this.customerName = `${this.prefix || ''} ${this.firstName || ''} ${this.lastName || ''}`.trim();
  }
  next();
});

export const Booking = mongoose.model('Booking', bookingSchema);
