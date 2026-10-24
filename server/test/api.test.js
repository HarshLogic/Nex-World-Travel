import app from '../src/app.js';

async function runTests() {
  console.log('--- Starting API Verification Test Suite ---');
  let failures = 0;

  const server = app.listen(5099, '127.0.0.1');

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
    // 1. Health check
    await check('Health Endpoint (/api/health)', async () => {
      const res = await fetch('http://127.0.0.1:5099/api/health');
      const data = await res.json();
      if (!res.ok || data.status !== 'healthy') throw new Error('Health check failed');
    });

    // 2. Destinations list
    await check('Destinations List (/api/destinations)', async () => {
      const res = await fetch('http://127.0.0.1:5099/api/destinations');
      const data = await res.json();
      if (!res.ok || !data.success || data.data.length < 4) throw new Error('Destinations list failed');
    });

    // 3. Single Destination by slug
    await check('Destination by Slug (/api/destinations/asia)', async () => {
      const res = await fetch('http://127.0.0.1:5099/api/destinations/asia');
      const data = await res.json();
      if (!res.ok || !data.success || data.data.slug !== 'asia') throw new Error('Single destination fetch failed');
    });

    // 4. Activities list
    await check('Activities List (/api/activities)', async () => {
      const res = await fetch('http://127.0.0.1:5099/api/activities');
      const data = await res.json();
      if (!res.ok || !data.success || data.data.length < 3) throw new Error('Activities list failed');
    });

    // 5. Packages list
    await check('Packages List (/api/packages)', async () => {
      const res = await fetch('http://127.0.0.1:5099/api/packages');
      const data = await res.json();
      if (!res.ok || !data.success || data.data.length < 3) throw new Error('Packages list failed');
    });

    // 6. Booking creation validation
    await check('Booking Validation Reject on Missing Consent', async () => {
      const res = await fetch('http://127.0.0.1:5099/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName: 'John',
          lastName: 'Doe',
          email: 'john@example.com',
          phone: '+971501234567',
          streetAddress: 'Corniche',
          stateProvince: 'Abu Dhabi',
          nationality: 'United Arab Emirates',
          destinationOrPackage: 'European Elegance',
          travelDate: '2026-11-20',
          adults: 2,
          activitiesRequired: 'Cruise',
          consent: false,
        }),
      });
      if (res.status !== 400) throw new Error('Expected 400 validation error for missing consent');
    });

    // 7. Successful Booking Submission
    let createdEnquiryNumber = null;
    await check('Booking Submission End-to-End (/api/bookings)', async () => {
      const res = await fetch('http://127.0.0.1:5099/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prefix: 'Dr.',
          firstName: 'Maya',
          lastName: 'Lin',
          email: 'maya.lin@example.com',
          phone: '+971559876543',
          streetAddress: 'Khalifa Park Area',
          stateProvince: 'Abu Dhabi',
          nationality: 'United Arab Emirates',
          destinationOrPackage: 'Asian Wonders: Tokyo, Bali & Singapore',
          travelDate: '2026-12-01',
          adults: 2,
          children: 1,
          activitiesRequired: 'Mount Fuji tour and private Balinese villa with sunset dinner',
          consent: true,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success || !data.data.enquiryNumber) {
        throw new Error('Failed to create booking: ' + JSON.stringify(data));
      }
      createdEnquiryNumber = data.data.enquiryNumber;
    });

    // 8. Contact Message Submission
    await check('Contact Message Submission (/api/contact)', async () => {
      const res = await fetch('http://127.0.0.1:5099/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: 'Tariq Al Mansoori',
          email: 'tariq@example.ae',
          phone: '+971502345678',
          subject: 'Corporate Incentive Group Travel 2026',
          message: 'We are organizing an executive retreat to Europe for 15 delegates in September.',
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success || !data.data.ticketNumber) {
        throw new Error('Failed to submit contact message: ' + JSON.stringify(data));
      }
    });

    // 9. Admin Review Protected Route
    await check('Admin Auth Protection & Listing', async () => {
      // Without token -> 401
      const unauthRes = await fetch('http://127.0.0.1:5099/api/bookings');
      if (unauthRes.status !== 401) throw new Error('Expected 401 without auth header');

      // With valid token -> 200
      const authRes = await fetch('http://127.0.0.1:5099/api/bookings', {
        headers: { Authorization: 'Bearer nex_admin_secret_key_2026' },
      });
      const data = await authRes.json();
      if (!authRes.ok || !data.success || !Array.isArray(data.data)) {
        throw new Error('Admin fetch failed');
      }
      const found = data.data.find((b) => b.enquiryNumber === createdEnquiryNumber);
      if (!found) throw new Error(`Created enquiry ${createdEnquiryNumber} not found in admin list`);
    });

    console.log(`\n--- Test Suite Completed: ${failures === 0 ? 'ALL TESTS PASSED 🎉' : `${failures} TESTS FAILED`} ---`);
  } finally {
    server.close();
  }

  if (failures > 0) process.exit(1);
}

runTests();
