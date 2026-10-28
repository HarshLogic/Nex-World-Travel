import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5MB
const ALLOWED_MIME_TYPES = {
  'image/jpeg': 'jpg',
  'image/jpg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
};

// Safe ensure directory helper
const ensureDir = (dirPath) => {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
};

export const uploadMedia = async (req, res, next) => {
  try {
    const { data, name, type } = req.body;

    if (!data) {
      return res.status(400).json({
        success: false,
        message: 'No image data provided. Please send a valid image file or data URI.',
      });
    }

    let mimeType = type;
    let base64String = data;

    // Check if it's a data URI format (e.g., data:image/png;base64,...)
    if (typeof data === 'string' && data.startsWith('data:')) {
      const matches = data.match(/^data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+);base64,(.+)$/);
      if (matches) {
        mimeType = matches[1].toLowerCase();
        base64String = matches[2];
      }
    }

    if (!mimeType || !ALLOWED_MIME_TYPES[mimeType]) {
      return res.status(400).json({
        success: false,
        message: 'Invalid image format. Supported formats are JPG, JPEG, PNG, and WebP.',
      });
    }

    const buffer = Buffer.from(base64String, 'base64');

    if (buffer.length > MAX_FILE_SIZE_BYTES) {
      return res.status(400).json({
        success: false,
        message: `Image size exceeds the maximum allowed limit of 5MB (Received ${(buffer.length / (1024 * 1024)).toFixed(2)}MB).`,
      });
    }

    const ext = ALLOWED_MIME_TYPES[mimeType] || 'jpg';
    const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
    const apiKey = process.env.CLOUDINARY_API_KEY;
    const apiSecret = process.env.CLOUDINARY_API_SECRET;

    // Cloudinary upload if environment variables are provided
    if (cloudName && apiKey && apiSecret) {
      try {
        const timestamp = Math.floor(Date.now() / 1000);
        const folder = 'nexworld';
        const stringToSign = `folder=${folder}&timestamp=${timestamp}${apiSecret}`;
        const signature = crypto.createHash('sha1').update(stringToSign).digest('hex');

        const formData = new URLSearchParams();
        formData.append('file', `data:${mimeType};base64,${base64String}`);
        formData.append('api_key', apiKey);
        formData.append('timestamp', String(timestamp));
        formData.append('folder', folder);
        formData.append('signature', signature);

        const cloudRes = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
          method: 'POST',
          body: formData,
        });

        if (cloudRes.ok) {
          const cloudData = await cloudRes.json();
          if (cloudData.secure_url) {
            return res.status(201).json({
              success: true,
              message: 'Image uploaded successfully to Cloudinary.',
              url: cloudData.secure_url,
              provider: 'cloudinary',
              size: buffer.length,
            });
          }
        }
      } catch (cloudErr) {
        console.warn('[MediaController] Cloudinary upload notice (falling back to local):', cloudErr.message);
      }
    }

    // Local Disk storage fallback
    const rawName = name ? path.parse(name).name.replace(/[^a-zA-Z0-9_-]/g, '') : 'img';
    const safeBase = rawName.slice(0, 30) || 'img';
    const filename = `${safeBase}-${Date.now()}-${crypto.randomBytes(3).toString('hex')}.${ext}`;

    const serverUploadsDir = path.resolve(__dirname, '../../public/uploads');
    const clientUploadsDir = path.resolve(__dirname, '../../../client/public/uploads');

    ensureDir(serverUploadsDir);
    const serverFilePath = path.join(serverUploadsDir, filename);
    fs.writeFileSync(serverFilePath, buffer);

    try {
      ensureDir(clientUploadsDir);
      const clientFilePath = path.join(clientUploadsDir, filename);
      fs.writeFileSync(clientFilePath, buffer);
    } catch (e) {
      // Non-fatal if client folder is in another directory/deployment
    }

    const publicUrl = `/uploads/${filename}`;

    res.status(201).json({
      success: true,
      message: 'Image uploaded successfully.',
      url: publicUrl,
      provider: 'local',
      filename,
      size: buffer.length,
    });
  } catch (error) {
    next(error);
  }
};

