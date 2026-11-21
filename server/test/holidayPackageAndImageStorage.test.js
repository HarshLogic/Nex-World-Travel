import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import app from '../src/app.js';
import { store } from '../src/services/storeService.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Minimal valid 1x1 JPEG buffer passing detectImageSignature
const VALID_JPEG_BUFFER = Buffer.from([
  0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10, 0x4a, 0x46, 0x49, 0x46, 0x00, 0x01, 0x01, 0x01, 0x00, 0x48,
  0x00, 0x48, 0x00, 0x00, 0xff, 0xdb, 0x00, 0x43, 0x00, 0x08, 0x06, 0x06, 0x07, 0x06, 0x05, 0x08,
  0x07, 0x07, 0x07, 0x09, 0x09, 0x08, 0x0a, 0x0c, 0x14, 0x0d, 0x0c, 0x0b, 0x0b, 0x0c, 0x19, 0x12,
  0x13, 0x0f, 0x14, 0x1d, 0x1a, 0x1f, 0x1e, 0x1d, 0x1a, 0x1c, 0x1c, 0x20, 0x24, 0x2e, 0x27, 0x20,
  0x22, 0x2c, 0x23, 0x1c, 0x1c, 0x28, 0x37, 0x29, 0x2c, 0x30, 0x31, 0x34, 0x34, 0x34, 0x1f, 0x27,
  0x39, 0x3d, 0x38, 0x32, 0x3c, 0x2e, 0x33, 0x34, 0x32, 0xff, 0xc0, 0x00, 0x0b, 0x08, 0x00, 0x01,
  0x00, 0x01, 0x01, 0x01, 0x11, 0x00, 0xff, 0xc4, 0x00, 0x1f, 0x00, 0x00, 0x01, 0x05, 0x01, 0x01,
  0x01, 0x01, 0x01, 0x01, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x01, 0x02, 0x03, 0x04,
  0x05, 0x06, 0x07, 0x08, 0x09, 0x0a, 0x0b, 0xff, 0xda, 0x00, 0x08, 0x01, 0x01, 0x00, 0x00, 0x3f,
  0x00, 0xbf, 0x00, 0xff, 0xd9,
]);

async function runHolidayPackageAndImageStorageTests() {
  console.log('\n======================================================================');
  console.log('🧪 Starting Holiday Package & Permanent Image Storage Test Suite');
  console.log('======================================================================\n');

  let failures = 0;
  const PORT = 5096;
  const BASE = `http://127.0.0.1:${PORT}/api/v1`;
  const ROOT = `http://127.0.0.1:${PORT}`;
  const server = app.listen(PORT, '127.0.0.1');

  const check = async (desc, fn) => {
    try {
      await fn();
      console.log(` ✅ PASS: ${desc}`);
    } catch (e) {
      console.error(` ❌ FAIL: ${desc} -> ${e.message}`);
      failures++;
    }
  };

  try {
    // 1. Authentication tokens
    let masterHeadToken = null;
    let employeeToken = null;
    let memberToken = null;

    await check('Master Head login', async () => {
      const res = await fetch(`${BASE}/auth/staff/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'admin@nexworldtravel.com', password: 'AdminPassword2026!' }),
      });
      const data = await res.json();
      if (!res.ok || !data.token) throw new Error(`Master head login failed: ${JSON.stringify(data)}`);
      masterHeadToken = data.token;
    });

    await check('Employee login', async () => {
      const res = await fetch(`${BASE}/auth/staff/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'staff@nexworldtravel.com', password: 'StaffPassword2026!' }),
      });
      const data = await res.json();
      if (!res.ok || !data.token) throw new Error(`Employee login failed: ${JSON.stringify(data)}`);
      employeeToken = data.token;
    });

    await check('Member login', async () => {
      const res = await fetch(`${BASE}/auth/member/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ memberId: 'NEX-M-1001', password: 'MemberPassword2026!' }),
      });
      const data = await res.json();
      if (!res.ok || !data.token) throw new Error(`Member login failed: ${JSON.stringify(data)}`);
      memberToken = data.token;
    });

    // =========================================================================
    // SECTION 1: PERMANENT IMAGE STORAGE & DISK WIPE SURVIVAL
    // =========================================================================
    let uploadedFilename = null;
    let uploadedPublicUrl = null;

    await check('Upload media and persist to database and memory', async () => {
      const base64Data = `data:image/jpeg;base64,${VALID_JPEG_BUFFER.toString('base64')}`;
      const res = await fetch(`${BASE}/media/upload`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${masterHeadToken}` },
        body: JSON.stringify({ data: base64Data, name: 'test-persistence.jpg', type: 'image/jpeg' }),
      });
      const data = await res.json();
      if (!res.ok || !data.success || !data.url) throw new Error(`Media upload failed: ${JSON.stringify(data)}`);
      uploadedFilename = data.filename;
      uploadedPublicUrl = data.url;
      if (!uploadedFilename) throw new Error('Missing filename in response');
    });

    await check('Serve uploaded image directly from disk', async () => {
      const res = await fetch(`${ROOT}${uploadedPublicUrl}`);
      if (!res.ok) throw new Error(`Failed to fetch uploaded image from ${uploadedPublicUrl}: ${res.status}`);
      const buf = Buffer.from(await res.arrayBuffer());
      if (buf.length !== VALID_JPEG_BUFFER.length) {
        throw new Error(`Buffer size mismatch: expected ${VALID_JPEG_BUFFER.length}, got ${buf.length}`);
      }
    });

    await check('Simulate container restart / disk wipe and serve image from persistent fallback', async () => {
      // Physically delete the file from all uploads directories to simulate ephemeral disk wipe
      const candidateDirs = [
        path.resolve(__dirname, '../public/uploads'),
        path.resolve(__dirname, '../../client/public/uploads'),
      ];
      for (const dir of candidateDirs) {
        const fp = path.join(dir, uploadedFilename);
        if (fs.existsSync(fp)) fs.unlinkSync(fp);
      }

      // Now request the image from /uploads/:filename (must be served by MongoDB / memory fallback)
      const res = await fetch(`${ROOT}/uploads/${uploadedFilename}`);
      if (!res.ok) {
        throw new Error(`Fallback failed: /uploads/${uploadedFilename} returned HTTP ${res.status}`);
      }

      const contentType = res.headers.get('content-type');
      if (!contentType || !contentType.includes('image/jpeg')) {
        throw new Error(`Expected image/jpeg Content-Type, got ${contentType}`);
      }

      const corp = res.headers.get('cross-origin-resource-policy');
      if (corp !== 'cross-origin') {
        throw new Error(`Expected Cross-Origin-Resource-Policy: cross-origin, got ${corp}`);
      }

      const etag = res.headers.get('etag');
      if (!etag) {
        throw new Error('Expected ETag header in fallback response');
      }

      const buf = Buffer.from(await res.arrayBuffer());
      if (buf.length !== VALID_JPEG_BUFFER.length) {
        throw new Error(`Fallback buffer size mismatch: expected ${VALID_JPEG_BUFFER.length}, got ${buf.length}`);
      }

      // Re-remove repopulated disk cache to test fallback 304 handling directly
      for (const dir of candidateDirs) {
        const fp = path.join(dir, uploadedFilename);
        if (fs.existsSync(fp)) fs.unlinkSync(fp);
      }

      // Verify 304 Not Modified from fallback
      const res304 = await fetch(`${ROOT}/uploads/${uploadedFilename}`, {
        headers: { 'If-None-Match': etag },
      });
      if (res304.status !== 304) {
        throw new Error(`Expected 304 Not Modified for matching ETag, got ${res304.status}`);
      }
    });

    // =========================================================================
    // SECTION 2: MASTER HEAD HOLIDAY PACKAGE CRUD & PERMISSIONS
    // =========================================================================
    let createdPackageSlug = null;
    let createdPackageId = null;

    await check('Unauthenticated user cannot create package (401)', async () => {
      const res = await fetch(`${BASE}/packages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: 'Unauthorized Test Package',
          destination: 'Paris, France',
          region: 'Europe',
          durationDays: 5,
        }),
      });
      if (res.status !== 401) throw new Error(`Expected 401 Unauthorized, got ${res.status}`);
    });

    await check('Member cannot create package (403)', async () => {
      const res = await fetch(`${BASE}/packages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${memberToken}` },
        body: JSON.stringify({
          title: 'Member Test Package',
          destination: 'Rome, Italy',
          region: 'Europe',
          durationDays: 5,
        }),
      });
      if (res.status !== 403) throw new Error(`Expected 403 Forbidden, got ${res.status}`);
    });

    await check('Employee cannot create package (403 - Master Head exclusive)', async () => {
      const res = await fetch(`${BASE}/packages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${employeeToken}` },
        body: JSON.stringify({
          title: 'Employee Test Package',
          destination: 'Tokyo, Japan',
          region: 'Asia',
          durationDays: 7,
        }),
      });
      if (res.status !== 403) throw new Error(`Expected 403 Forbidden for employee, got ${res.status}`);
    });

    await check('Master Head can create holiday package with binary image data', async () => {
      const base64Data = `data:image/jpeg;base64,${VALID_JPEG_BUFFER.toString('base64')}`;
      const res = await fetch(`${BASE}/packages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${masterHeadToken}` },
        body: JSON.stringify({
          title: 'Alpine Splendour & Swiss Lakes',
          destination: 'Zurich, Lucerne & Interlaken, Switzerland',
          region: 'Europe',
          durationDays: 8,
          durationNights: 7,
          price: 14500,
          priceEstimateNote: 'Includes first-class Swiss Travel Pass & 5-star alpine chalets',
          tagline: 'Scenic panoramic rail, crystal alpine waters, and soaring glacial peaks.',
          overview: 'An unforgettable 8-day private luxury journey through the heart of the Swiss Alps.',
          includes: [
            '7 nights in 5-star alpine boutique hotels',
            'First-class Glacier Express panoramic rail journey',
            'Private boat cruise on Lake Lucerne',
          ],
          itinerarySummary: [
            { day: 1, title: 'Arrival in Zurich', description: 'Private chauffeur transfer and welcome reception' },
            { day: 3, title: 'Lucerne & Mount Pilatus', description: 'Cogwheel railway and panoramic cruise' },
            { day: 6, title: 'Interlaken & Jungfraujoch', description: 'Top of Europe glacier experience' },
          ],
          imageData: base64Data,
          publicationStatus: 'published',
          featured: true,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success || !data.data) {
        throw new Error(`Package creation failed: ${JSON.stringify(data)}`);
      }

      createdPackageSlug = data.data.slug;
      createdPackageId = data.data._id || data.data.id;
      if (!createdPackageSlug) throw new Error('Package created without slug');
      if (data.data.price !== 14500) throw new Error(`Expected price 14500, got ${data.data.price}`);
      if (!data.data.hasDirectImage) throw new Error('Expected hasDirectImage to be true');
    });

    await check('Public can fetch newly created package and stream binary image', async () => {
      const res = await fetch(`${BASE}/packages/${createdPackageSlug}`);
      if (!res.ok) throw new Error(`Public fetch failed with HTTP ${res.status}`);
      const data = await res.json();
      if (!data.success || data.data.title !== 'Alpine Splendour & Swiss Lakes') {
        throw new Error(`Data mismatch: ${JSON.stringify(data)}`);
      }

      // Stream direct image
      const imgRes = await fetch(`${BASE}/packages/${createdPackageSlug}/image`);
      if (!imgRes.ok) throw new Error(`Package image endpoint returned HTTP ${imgRes.status}`);
      const contentType = imgRes.headers.get('content-type');
      if (!contentType || !contentType.includes('image/jpeg')) {
        throw new Error(`Expected image/jpeg, got ${contentType}`);
      }
      const buf = Buffer.from(await imgRes.arrayBuffer());
      if (buf.length !== VALID_JPEG_BUFFER.length) {
        throw new Error(`Image size mismatch: expected ${VALID_JPEG_BUFFER.length}, got ${buf.length}`);
      }
    });

    // =========================================================================
    // SECTION 3: STRICT IMAGE PRESERVATION ON TEXT EDIT
    // =========================================================================
    await check('Editing text ONLY preserves image 100% without deletion or overwriting', async () => {
      // Update price and title WITHOUT sending any image data
      const updateRes = await fetch(`${BASE}/packages/${createdPackageId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${masterHeadToken}` },
        body: JSON.stringify({
          title: 'Alpine Splendour & Grand Swiss Lakes (Updated)',
          price: 15900,
          overview: 'Updated overview text without touching image.',
        }),
      });

      const updateData = await updateRes.json();
      if (!updateRes.ok || !updateData.success) {
        throw new Error(`Package update failed: ${JSON.stringify(updateData)}`);
      }

      if (updateData.data.price !== 15900) {
        throw new Error(`Expected updated price 15900, got ${updateData.data.price}`);
      }

      // Verify image is still perfectly available and unchanged
      const imgRes = await fetch(`${BASE}/packages/${createdPackageSlug}/image`);
      if (!imgRes.ok) {
        throw new Error(`Image was lost or corrupted after text edit! HTTP ${imgRes.status}`);
      }
      const buf = Buffer.from(await imgRes.arrayBuffer());
      if (buf.length !== VALID_JPEG_BUFFER.length) {
        throw new Error(`Image buffer changed after text edit! Expected ${VALID_JPEG_BUFFER.length}, got ${buf.length}`);
      }
    });

    // =========================================================================
    // SECTION 4: IMAGE REPLACEMENT SAFETY
    // =========================================================================
    await check('Replacing image updates direct MongoDB image successfully', async () => {
      // Create a slightly modified valid image payload (change a non-header byte)
      const newImageBuffer = Buffer.from(VALID_JPEG_BUFFER);
      newImageBuffer[15] = 0x50; // Modify a JFIF byte

      const newBase64 = `data:image/jpeg;base64,${newImageBuffer.toString('base64')}`;
      const uploadRes = await fetch(`${BASE}/packages/${createdPackageId}/image`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${masterHeadToken}` },
        body: JSON.stringify({ data: newBase64, name: 'swiss-new.jpg' }),
      });

      const uploadData = await uploadRes.json();
      if (!uploadRes.ok || !uploadData.success) {
        throw new Error(`Package image replacement failed: ${JSON.stringify(uploadData)}`);
      }

      const imgRes = await fetch(`${BASE}/packages/${createdPackageSlug}/image`);
      if (!imgRes.ok) throw new Error(`Stream new image failed: HTTP ${imgRes.status}`);
      const buf = Buffer.from(await imgRes.arrayBuffer());
      if (buf[15] !== 0x50) {
        throw new Error('New image data was not properly persisted in MongoDB');
      }
    });

    // =========================================================================
    // SECTION 5: PUBLICATION STATUS & VISIBILITY CONTROL
    // =========================================================================
    await check('Draft packages are hidden from public and visible to Master Head', async () => {
      // Toggle to draft
      const draftRes = await fetch(`${BASE}/packages/${createdPackageId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${masterHeadToken}` },
        body: JSON.stringify({ publicationStatus: 'draft' }),
      });
      if (!draftRes.ok) throw new Error('Failed to set package to draft');

      // Public list should not include it
      const publicListRes = await fetch(`${BASE}/packages`);
      const publicList = await publicListRes.json();
      const inPublic = publicList.data.some((p) => p.slug === createdPackageSlug);
      if (inPublic) throw new Error('Draft package was found in public package list!');

      // Public single get should return 404
      const singleRes = await fetch(`${BASE}/packages/${createdPackageSlug}`);
      if (singleRes.status !== 404) {
        throw new Error(`Expected 404 for draft package, got ${singleRes.status}`);
      }

      // Public single image should return 404
      const imgRes = await fetch(`${BASE}/packages/${createdPackageSlug}/image`);
      if (imgRes.status !== 404) {
        throw new Error(`Expected 404 for draft package image, got ${imgRes.status}`);
      }

      // Master Head with includeDrafts can see it
      const adminListRes = await fetch(`${BASE}/packages?includeDrafts=true`, {
        headers: { Authorization: `Bearer ${masterHeadToken}` },
      });
      const adminList = await adminListRes.json();
      const inAdmin = adminList.data.some((p) => p.slug === createdPackageSlug);
      if (!inAdmin) throw new Error('Master head cannot see draft package in management view');

      // Restore to published
      await fetch(`${BASE}/packages/${createdPackageId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${masterHeadToken}` },
        body: JSON.stringify({ publicationStatus: 'published' }),
      });
    });

    // =========================================================================
    // SECTION 6: SAFE SOFT DELETION & ARCHIVING
    // =========================================================================
    await check('Master Head can soft delete / archive package safely', async () => {
      const delRes = await fetch(`${BASE}/packages/${createdPackageId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${masterHeadToken}` },
      });
      const delData = await delRes.json();
      if (!delRes.ok || !delData.success) {
        throw new Error(`Package deletion failed: ${JSON.stringify(delData)}`);
      }

      // Verify public list does NOT include deleted package
      const publicListRes = await fetch(`${BASE}/packages`);
      const publicList = await publicListRes.json();
      const inPublic = publicList.data.some((p) => p.slug === createdPackageSlug);
      if (inPublic) throw new Error('Deleted package still visible in public list');

      // Verify active admin list does NOT include deleted package
      const adminListRes = await fetch(`${BASE}/packages?includeDrafts=true`, {
        headers: { Authorization: `Bearer ${masterHeadToken}` },
      });
      const adminList = await adminListRes.json();
      const inAdmin = adminList.data.some((p) => p.slug === createdPackageSlug);
      if (inAdmin) throw new Error('Deleted package still visible in admin list');
    });

    // =========================================================================
    // SECTION 7: EMPLOYEE READ-ONLY ACCESS PRESERVED
    // =========================================================================
    await check('Employee can read packages but cannot delete or edit', async () => {
      const readRes = await fetch(`${BASE}/packages`, {
        headers: { Authorization: `Bearer ${employeeToken}` },
      });
      if (!readRes.ok) throw new Error(`Employee could not read packages: HTTP ${readRes.status}`);
      const data = await readRes.json();
      if (!data.success || !Array.isArray(data.data)) throw new Error('Invalid packages response for employee');

      // Employee cannot patch
      const patchRes = await fetch(`${BASE}/packages/european-elegance`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${employeeToken}` },
        body: JSON.stringify({ title: 'Hacked Title' }),
      });
      if (patchRes.status !== 403) throw new Error(`Expected 403 for employee PATCH, got ${patchRes.status}`);

      // Employee cannot delete
      const deleteRes = await fetch(`${BASE}/packages/european-elegance`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${employeeToken}` },
      });
      if (deleteRes.status !== 403) throw new Error(`Expected 403 for employee DELETE, got ${deleteRes.status}`);
    });

  } finally {
    server.close();
  }

  console.log('\n======================================================================');
  if (failures === 0) {
    console.log('🎉 ALL HOLIDAY PACKAGE & IMAGE STORAGE TESTS PASSED SUCCESSFULLY!');
  } else {
    console.error(`💥 ${failures} TEST(S) FAILED.`);
    process.exit(1);
  }
  console.log('======================================================================\n');
}

runHolidayPackageAndImageStorageTests().catch((e) => {
  console.error('Fatal test error:', e);
  process.exit(1);
});
