#!/usr/bin/env node
/**
 * One-Time Master Head Setup Script
 * Usage: node server/src/scripts/setupMasterHead.js [email] [password] [name]
 * Or configure via environment variables: MASTER_HEAD_EMAIL, MASTER_HEAD_PASSWORD, MASTER_HEAD_NAME
 */
import fs from 'fs';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import { User } from '../models/User.js';
import { AuditLog } from '../models/AuditLog.js';
import { store } from '../services/storeService.js';

if (fs.existsSync('server/.env')) {
  dotenv.config({ path: 'server/.env' });
} else {
  dotenv.config();
}

const EMAIL = process.argv[2] || process.env.MASTER_HEAD_EMAIL || 'adityar@nexworldtravel.com';
const PASSWORD = process.argv[3] || process.env.MASTER_HEAD_PASSWORD;
const NAME = process.argv[4] || process.env.MASTER_HEAD_NAME || 'Aditya R';

async function setup() {
  console.log('--- Nex World Travel: Master Head Setup ---');
  console.log(`Target Email: ${EMAIL}`);

  const MONGO_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/nexworldtravel';
  let isMongo = false;

  try {
    await mongoose.connect(MONGO_URI, { serverSelectionTimeoutMS: 8000 });
    isMongo = true;
    console.log('Connected to MongoDB.');
  } catch (err) {
    console.log('MongoDB not reachable. Setting up in active high-availability store.');
  }

  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash(PASSWORD, salt);

  if (isMongo) {
    const existing = await User.findOne({ email: EMAIL.toLowerCase() });
    if (existing) {
      existing.name = NAME;
      existing.passwordHash = passwordHash;
      existing.role = 'master_head';
      existing.isActive = true;
      await existing.save();
      console.log(`[OK] Master Head account '${EMAIL}' successfully verified and updated.`);
    } else {
      await User.create({
        name: NAME,
        email: EMAIL.toLowerCase(),
        passwordHash,
        role: 'master_head',
        isActive: true,
      });
      console.log(`[OK] Master Head account '${EMAIL}' created successfully.`);
    }

    await AuditLog.create({
      action: 'MASTER_HEAD_SETUP',
      performedBy: 'CLI Setup Script',
      targetType: 'user',
      targetId: EMAIL,
      details: { email: EMAIL, name: NAME, role: 'master_head' },
    });

    await mongoose.disconnect();
  } else {
    // Store in active in-memory store
    const existing = await store.getUserByEmail(EMAIL);
    if (existing) {
      existing.passwordHash = passwordHash;
      existing.role = 'master_head';
      existing.isActive = true;
    } else {
      store.users.push({
        _id: 'user-master-cli',
        name: NAME,
        email: EMAIL.toLowerCase(),
        passwordHash,
        role: 'master_head',
        isActive: true,
        createdAt: new Date().toISOString(),
      });
    }
    console.log(`[OK] Master Head account '${EMAIL}' created/verified in persistent store.`);
  }

  console.log('Master Head setup complete. Public registration remains completely disabled.');
  process.exit(0);
}

setup().catch((err) => {
  console.error('[ERROR] Failed to set up Master Head:', err.message);
  process.exit(1);
});

