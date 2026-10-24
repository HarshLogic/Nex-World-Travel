import mongoose from 'mongoose';

const contactSchema = new mongoose.Schema(
  {
    ticketNumber: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
    },
    fullName: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true },
    phone: { type: String, trim: true, default: '' },
    subject: { type: String, required: true, trim: true },
    message: { type: String, required: true, trim: true },
    status: {
      type: String,
      enum: ['unread', 'responded', 'resolved'],
      default: 'unread',
    },
  },
  { timestamps: true }
);

export const Contact = mongoose.model('Contact', contactSchema);
