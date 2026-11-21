import mongoose from 'mongoose';

const uploadedMediaSchema = new mongoose.Schema(
  {
    filename: { type: String, required: true, unique: true, index: true },
    originalName: { type: String, default: '' },
    contentType: { type: String, required: true, default: 'image/jpeg' },
    size: { type: Number, default: 0 },
    data: { type: Buffer, required: true },
    uploadedBy: { type: String, default: 'Master Head' },
  },
  { timestamps: true }
);

export const UploadedMedia = mongoose.model('UploadedMedia', uploadedMediaSchema);
