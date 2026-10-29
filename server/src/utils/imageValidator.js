export const MAX_IMAGE_SIZE_BYTES = 1 * 1024 * 1024; // Exactly 1 MB

/**
 * Validates actual binary file signatures (magic bytes) to prevent extension spoofing.
 * Supports JPEG, PNG, and WebP.
 */
export const detectImageSignature = (buffer) => {
  if (!buffer || !Buffer.isBuffer(buffer) || buffer.length < 12) {
    return null;
  }

  // 1. JPEG: FF D8 FF
  if (buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) {
    return { mimeType: 'image/jpeg', ext: 'jpg' };
  }

  // 2. PNG: 89 50 4E 47 0D 0A 1A 0A
  if (
    buffer[0] === 0x89 &&
    buffer[1] === 0x50 &&
    buffer[2] === 0x4e &&
    buffer[3] === 0x47 &&
    buffer[4] === 0x0d &&
    buffer[5] === 0x0a &&
    buffer[6] === 0x1a &&
    buffer[7] === 0x0a
  ) {
    return { mimeType: 'image/png', ext: 'png' };
  }

  // 3. WebP: 'RIFF' at bytes 0-3 and 'WEBP' at bytes 8-11
  if (
    buffer.subarray(0, 4).toString('ascii') === 'RIFF' &&
    buffer.subarray(8, 12).toString('ascii') === 'WEBP'
  ) {
    return { mimeType: 'image/webp', ext: 'webp' };
  }

  return null;
};

/**
 * Parses and strictly validates image input (Buffer or base64).
 * Enforces <= 1MB and genuine image signature.
 */
export const parseAndValidateImage = (inputData, originalName = '') => {
  if (!inputData) return null;

  let buffer;
  if (Buffer.isBuffer(inputData)) {
    buffer = inputData;
  } else if (typeof inputData === 'string') {
    let cleanBase64 = inputData.trim();
    if (cleanBase64.startsWith('data:')) {
      const match = cleanBase64.match(/^data:[^;]+;base64,(.+)$/);
      if (match) {
        cleanBase64 = match[1];
      }
    }
    buffer = Buffer.from(cleanBase64, 'base64');
  } else {
    throw new Error('Unsupported image data type. Expected Buffer or base64 string.');
  }

  if (buffer.length === 0) {
    throw new Error('Empty image payload provided.');
  }

  if (buffer.length > MAX_IMAGE_SIZE_BYTES) {
    const sizeInKb = (buffer.length / 1024).toFixed(1);
    throw new Error(`Image size (${sizeInKb} KB) exceeds the maximum allowed limit of 1 MB (1024 KB).`);
  }

  const sig = detectImageSignature(buffer);
  if (!sig) {
    throw new Error('Invalid or unsupported image format. Only genuine JPEG, PNG, and WebP images are allowed.');
  }

  return {
    buffer,
    mimeType: sig.mimeType,
    ext: sig.ext,
    size: buffer.length,
    originalName: originalName || `image.${sig.ext}`,
  };
};

