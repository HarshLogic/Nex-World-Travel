import mongoose from 'mongoose';

const paymentTransactionSchema = new mongoose.Schema(
  {
    transactionId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      uppercase: true,
      index: true,
    },
    memberId: {
      type: String,
      required: true,
      trim: true,
      uppercase: true,
      index: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    paymentType: {
      type: String,
      required: true,
      enum: ['down_payment', 'emi_installment', 'lump_sum', 'adjustment', 'refund'],
      default: 'emi_installment',
    },
    paymentMethod: {
      type: String,
      required: true,
      enum: ['Bank Transfer', 'Credit Card', 'Debit Card', 'Cheque', 'Cash', 'Account Adjustment'],
      default: 'Bank Transfer',
    },
    referenceNumber: {
      type: String,
      trim: true,
      default: '',
    },
    notes: {
      type: String,
      trim: true,
      default: '',
    },
    recordedBy: {
      type: String,
      required: true,
      trim: true,
    },
    date: {
      type: Date,
      required: true,
      default: Date.now,
      index: true,
    },
  },
  { timestamps: true }
);

export const PaymentTransaction = mongoose.model('PaymentTransaction', paymentTransactionSchema);

