const fs = require('fs');
const path = require('path');
const sharp = require('sharp');
const crypto = require('crypto');

const UPLOAD_DIR = path.join(__dirname, '../../public/uploads/covers');
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_FORMATS = ['jpeg', 'png', 'webp'];
const TARGET_WIDTH = 1200;
const TARGET_HEIGHT = 600;

// Ensure upload directory exists
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

const validateImageFile = (buffer, mimeType) => {
  const errors = [];

  // Check file size
  if (buffer.length > MAX_FILE_SIZE) {
    errors.push('Image must be less than 5MB');
  }

  // Check MIME type
  if (!['image/jpeg', 'image/png', 'image/webp'].includes(mimeType)) {
    errors.push('Image must be JPG, PNG, or WebP');
  }

  return { valid: errors.length === 0, errors };
};

const processAndSaveImage = async (buffer, eventId) => {
  try {
    // Generate unique filename
    const filename = `${eventId}-${crypto.randomBytes(8).toString('hex')}.jpg`;
    const filepath = path.join(UPLOAD_DIR, filename);

    // Resize and optimize
    await sharp(buffer)
      .resize(TARGET_WIDTH, TARGET_HEIGHT, {
        fit: 'cover',
        position: 'center',
      })
      .jpeg({ quality: 80 })
      .toFile(filepath);

    // Return URL path (relative to public)
    return `/uploads/covers/${filename}`;
  } catch (error) {
    throw new Error(`Failed to process image: ${error.message}`);
  }
};

module.exports = {
  validateImageFile,
  processAndSaveImage,
  MAX_FILE_SIZE,
};
