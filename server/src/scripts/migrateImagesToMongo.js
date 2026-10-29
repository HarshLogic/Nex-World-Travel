import 'dotenv/config';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';
import { Destination } from '../models/Destination.js';
import { detectImageSignature } from '../utils/imageValidator.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const resolveCandidatePath = (relPath) => {
  if (!relPath || typeof relPath !== 'string') return null;
  const clean = relPath.replace(/^\/+/, '');
  const roots = [
    path.resolve(clean),
    path.resolve(__dirname, '../../../client/public', clean),
    path.resolve(__dirname, '../../public', clean),
    path.resolve(__dirname, '../../../public', clean),
    path.resolve(__dirname, '../../', clean),
  ];

  for (const candidate of roots) {
    if (fs.existsSync(candidate) && fs.statSync(candidate).isFile()) {
      return candidate;
    }
  }
  return null;
};

const runMigration = async () => {
  console.log('\n======================================================');
  console.log('🚀 Starting Safe MongoDB Destination Image Migration');
  console.log('======================================================\n');

  const mongoUri =
    process.env.MONGO_URI ||
    process.env.MONGODB_URI ||
    'mongodb+srv://harshvardhan:Harsh8084@nexworld.wuggq8v.mongodb.net/nex_world_travel?retryWrites=true&w=majority&appName=Nexworld';

  try {
    await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 5000 });
    console.log('✅ Connected to MongoDB Atlas successfully.');
  } catch (err) {
    console.error('❌ Could not connect to MongoDB:', err.message);
    process.exit(1);
  }

  try {
    const destinations = await Destination.find({ isDeleted: { $ne: true } }).select('+image.data');
    console.log(`Found ${destinations.length} active destinations in database.\n`);

    let alreadyMigrated = 0;
    let newlyMigrated = 0;
    let localMissing = 0;

    for (const dest of destinations) {
      if (dest.hasDirectImage && dest.image?.data && dest.image.data.length > 0) {
        console.log(`ℹ️ [Skipped] "${dest.title}" (${dest.slug}): already stored directly in MongoDB (${(dest.image.data.length / 1024).toFixed(1)} KB).`);
        alreadyMigrated++;
        continue;
      }

      const targetPath = dest.coverImage || dest.imageUrl;
      if (!targetPath) {
        console.log(`⚠️ [Warning] "${dest.title}" (${dest.slug}): has no image reference. Preserving record.`);
        continue;
      }

      const diskFile = resolveCandidatePath(targetPath);
      if (diskFile) {
        const fileBuffer = fs.readFileSync(diskFile);
        const sig = detectImageSignature(fileBuffer);

        if (!sig) {
          console.warn(`⚠️ [Warning] "${dest.title}" (${dest.slug}): local file signature is not JPEG/PNG/WebP. Skipping binary conversion.`);
          continue;
        }

        dest.image = {
          data: fileBuffer,
          contentType: sig.mimeType,
          originalName: path.basename(diskFile),
          size: fileBuffer.length,
        };
        dest.hasDirectImage = true;
        dest.coverImage = `/api/v1/destinations/${dest.slug}/image`;
        dest.imageUrl = `/api/v1/destinations/${dest.slug}/image`;
        dest.updatedBy = 'Migration Script';
        await dest.save();

        console.log(`✅ [Migrated] "${dest.title}" (${dest.slug}): saved ${dest.image.size} bytes (${sig.mimeType}) directly to MongoDB.`);
        newlyMigrated++;
      } else {
        console.log(`ℹ️ [Preserved] "${dest.title}" (${dest.slug}): local file not found on disk (${targetPath}). Preserving document with legacy URL.`);
        localMissing++;
      }
    }

    console.log('\n======================================================');
    console.log('📊 Migration Summary:');
    console.log(`- Total Destinations: ${destinations.length}`);
    console.log(`- Newly Migrated to MongoDB: ${newlyMigrated}`);
    console.log(`- Already in MongoDB: ${alreadyMigrated}`);
    console.log(`- Preserved with Legacy URLs: ${localMissing}`);
    console.log('======================================================\n');
  } catch (error) {
    console.error('❌ Migration error:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('MongoDB connection closed.');
  }
};

runMigration();

