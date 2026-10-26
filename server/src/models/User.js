import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    role: {
      type: String,
      required: true,
      enum: ['member', 'employee', 'master_head'],
      default: 'member',
      index: true,
    },
    // For members, memberId is the unique login identifier (case-insensitive normalized)
    memberId: {
      type: String,
      sparse: true,
      trim: true,
      uppercase: true,
      index: true,
    },
    // For staff and master_head, email is the login identifier
    email: {
      type: String,
      sparse: true,
      trim: true,
      lowercase: true,
      index: true,
    },
    passwordHash: {
      type: String,
      required: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    phone: {
      type: String,
      trim: true,
      default: '',
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
    lastLogin: {
      type: Date,
      default: null,
    },
    mustChangePassword: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

// Prevent returning passwordHash in queries by default
userSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.passwordHash;
  return obj;
};

export const User = mongoose.model('User', userSchema);

