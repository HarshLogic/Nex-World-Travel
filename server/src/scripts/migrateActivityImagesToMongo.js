import 'dotenv/config';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';
import { Activity } from '../models/Activity.js';
import { detectImageSignature } from '../utils/imageValidator.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '../../../');

const resolveCandidatePath = (relPath) => {
  if (!relPath || typeof relPath !== 'string') return null;
  const clean = relPath.replace(/^\/+/, '');
  const roots = [
    path.resolve(repoRoot, clean),
    path.resolve(clean),
    path.resolve(repoRoot, 'client/public', clean.replace(/^(client\/public\/|public\/)/, '')),
    path.resolve(repoRoot, 'server/public', clean.replace(/^(server\/public\/|public\/)/, '')),
    path.resolve(repoRoot, 'client/public/images', clean.replace(/^(client\/public\/|public\/|images\/)/, '')),
    path.resolve(repoRoot, 'client/public/images/activities', clean.replace(/^(client\/public\/|public\/|images\/|activities\/)/, '')),
    path.resolve(repoRoot, 'client/public/images/destinations', clean.replace(/^(client\/public\/|public\/|images\/|destinations\/)/, '')),
    path.resolve(repoRoot, 'client/public/images/services', clean.replace(/^(client\/public\/|public\/|images\/|services\/)/, '')),
  ];

  for (const candidate of roots) {
    if (fs.existsSync(candidate) && fs.statSync(candidate).isFile()) {
      return candidate;
    }
  }
  return null;
};

const ACTIVITY_IMAGE_MAPPINGS = {
  'vip-evening-desert-safari': 'client/public/images/activities/desert-safari.webp',
  'museum-of-the-future-tour': 'client/public/images/destinations/uae.jpg',
  'seine-river-dinner-cruise': 'client/public/images/destinations/europe.jpg',
  'great-barrier-reef-marine-safari': 'client/public/images/destinations/australia.jpg',
  'mount-fuji-hakone-discovery': 'client/public/images/destinations/asia.jpg',
  'yas-island-parks-pass': 'client/public/images/activities/adventure.jpg',
  'international-tours-activities': 'client/public/images/services/activities.jpg',
};

const runMigration = async () => {
  console.log('\n======================================================');
  console.log('🚀 Starting Safe MongoDB Activity Image Migration');
  console.log('======================================================\n');

  const mongoUri =
    process.env.MONGO_URI ||
    process.env.MONGODB_URI ||
    'mongodb+srv://harshvardhansinha17_db_user:cXVTvgxC3NVjBZwS@nexworld.wuggq8v.mongodb.net/nex_world_travel?retryWrites=true&w=majority';

  try {
    await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 8000 });
    console.log('✅ Connected to MongoDB Atlas successfully.');
  } catch (err) {
    console.error('❌ Could not connect to MongoDB:', err.message);
    process.exit(1);
  }

  try {
    const activities = await Activity.find({ isDeleted: { $ne: true } }).select('+image.data');
    console.log(`Found ${activities.length} active activities in database.\n`);

    const serverUploadsDir = path.resolve(repoRoot, 'server/public/uploads');
    const clientUploadsDir = path.resolve(repoRoot, 'client/public/uploads');
    if (!fs.existsSync(serverUploadsDir)) fs.mkdirSync(serverUploadsDir, { recursive: true });
    if (!fs.existsSync(clientUploadsDir)) fs.mkdirSync(clientUploadsDir, { recursive: true });

    let alreadyMigrated = 0;
    let newlyMigrated = 0;
    let localMissing = 0;

    for (const act of activities) {
      const slug = (act.slug || '').toLowerCase();
      console.log(`Processing activity: "${act.title}" (${slug})`);

      // 1. Resolve source image file
      let candidateFile = resolveCandidatePath(act.coverImage || act.imageUrl);
      if (!candidateFile && ACTIVITY_IMAGE_MAPPINGS[slug]) {
        candidateFile = resolveCandidatePath(ACTIVITY_IMAGE_MAPPINGS[slug]);
      }
      if (!candidateFile) {
        // Fallback by keyword in slug
        for (const [key, relPath] of Object.entries(ACTIVITY_IMAGE_MAPPINGS)) {
          if (slug.includes(key) || key.includes(slug)) {
            candidateFile = resolveCandidatePath(relPath);
            if (candidateFile) break;
          }
        }
      }

      if (candidateFile && fs.existsSync(candidateFile)) {
        const fileBuffer = fs.readFileSync(candidateFile);
        const sig = detectImageSignature(fileBuffer);
        const mimeType = sig ? sig.mimeType : 'image/jpeg';

        // Save image buffer to MongoDB
        act.image = {
          data: fileBuffer,
          contentType: mimeType,
          originalName: path.basename(candidateFile),
          size: fileBuffer.length,
        };
        act.hasDirectImage = true;

        // If legacy URL is an /uploads/ path, copy the image to that exact upload filename on disk
        const currentPath = act.imageUrl || act.coverImage || '';
        if (currentPath.startsWith('/uploads/')) {
          const uploadFilename = path.basename(currentPath);
          try {
            fs.writeFileSync(path.join(serverUploadsDir, uploadFilename), fileBuffer);
            fs.writeFileSync(path.join(clientUploadsDir, uploadFilename), fileBuffer);
            console.log(`  📁 Mirrored static file to /uploads/${uploadFilename}`);
          } catch (e) {
            console.warn(`  ⚠️ Could not write static mirror:`, e.message);
          }
        }

        // Set direct image URL
        const directUrl = `/api/v1/activities/${act.slug || act._id}/image`;
        act.imageUrl = directUrl;
        act.coverImage = directUrl;
        act.updatedBy = 'Migration Script';
        await act.save();

        console.log(`  ✅ [Migrated] Saved ${fileBuffer.length} bytes (${mimeType}) into MongoDB.`);
        newlyMigrated++;
      } else {
        console.log(`  ⚠️ [Preserved] No local source file found. Preserving current record.`);
        localMissing++;
      }
    }

    console.log('\n======================================================');
    console.log('📊 Migration Summary:');
    console.log(`- Total Activities: ${activities.length}`);
    console.log(`- Newly Migrated to MongoDB: ${newlyMigrated}`);
    console.log(`- Already in MongoDB: ${alreadyMigrated}`);
    console.log(`- Preserved without change: ${localMissing}`);
    console.log('======================================================\n');
  } catch (error) {
    console.error('❌ Migration error:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('MongoDB connection closed.');
  }
};

runMigration();
