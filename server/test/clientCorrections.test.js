import app from '../src/app.js';

async function runClientCorrectionTests() {
  console.log('--- Starting Client Corrections Verification Test Suite ---');
  let failures = 0;

  const PORT = 5099;
  const BASE = `http://127.0.0.1:${PORT}/api/v1`;
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
    // Login as Master Head
    let adminToken = null;
    await check('Master Head login', async () => {
      const res = await fetch(`${BASE}/auth/staff/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'admin@nexworldtravel.com', password: 'AdminPassword2026!' }),
      });
      const data = await res.json();
      if (!res.ok || !data.token) throw new Error(`Admin login failed: ${JSON.stringify(data)}`);
      adminToken = data.token;
    });

    // 1. Member ID & Phone Validation + Trial Plan Support
    const trialMemberId = 'NWT-TR-831';
    const trialMemberEmail = `trial.member.${Date.now()}@nexworldtravel.com`;
    const trialMemberInitialPassword = 'TrialPassword2026!';

    await check('Member ID max length (30 chars), Phone validation (7-15 digits, no letters), and Trial Plan', async () => {
      // Reject Member ID > 30 chars
      const longIdRes = await fetch(`${BASE}/members`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${adminToken}` },
        body: JSON.stringify({
          memberId: 'NWT-VERY-LONG-MEMBER-IDENTIFIER-OVER-30-CHARS',
          registeredName: 'Overlong ID Member',
          email: `longid.${Date.now()}@nexworldtravel.com`,
          phone: '+971-50-123-4567',
          password: 'MemberPassword123!',
          packageType: 'Trial Plan',
          productPrice: 5000,
        }),
      });
      if (longIdRes.status !== 400) {
        throw new Error(`Expected 400 for Member ID > 30 chars, got ${longIdRes.status}`);
      }

      // Reject alphabetic phone
      const badPhoneLetters = await fetch(`${BASE}/members`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${adminToken}` },
        body: JSON.stringify({
          memberId: 'NWT-PH-ERR1',
          registeredName: 'Bad Phone Letters',
          email: `badphone1.${Date.now()}@nexworldtravel.com`,
          phone: '+971-ABC-5555',
          password: 'MemberPassword123!',
          packageType: 'Trial Plan',
          productPrice: 5000,
        }),
      });
      if (badPhoneLetters.status !== 400) {
        throw new Error(`Expected 400 for alphabetic phone, got ${badPhoneLetters.status}`);
      }

      // Reject phone > 15 digits
      const badPhoneLong = await fetch(`${BASE}/members`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${adminToken}` },
        body: JSON.stringify({
          memberId: 'NWT-PH-ERR2',
          registeredName: 'Bad Phone Long',
          email: `badphone2.${Date.now()}@nexworldtravel.com`,
          phone: '+9711234567890123456',
          password: 'MemberPassword123!',
          packageType: 'Trial Plan',
          productPrice: 5000,
        }),
      });
      if (badPhoneLong.status !== 400) {
        throw new Error(`Expected 400 for phone > 15 digits, got ${badPhoneLong.status}`);
      }

      // Reject phone < 7 digits
      const badPhoneShort = await fetch(`${BASE}/members`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${adminToken}` },
        body: JSON.stringify({
          memberId: 'NWT-PH-ERR3',
          registeredName: 'Bad Phone Short',
          email: `badphone3.${Date.now()}@nexworldtravel.com`,
          phone: '12345',
          password: 'MemberPassword123!',
          packageType: 'Trial Plan',
          productPrice: 5000,
        }),
      });
      if (badPhoneShort.status !== 400) {
        throw new Error(`Expected 400 for phone < 7 digits, got ${badPhoneShort.status}`);
      }

      // Accept valid Member ID + international Phone + Trial Plan
      const createRes = await fetch(`${BASE}/members`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${adminToken}` },
        body: JSON.stringify({
          memberId: trialMemberId,
          registeredName: 'Trial Plan Member',
          email: trialMemberEmail,
          phone: '+971-50-987-6543',
          password: trialMemberInitialPassword,
          packageType: 'Trial Plan',
          allottedNights: 5,
          availableNights: 5,
          productPrice: 4500,
          initialPaidAmount: 1500,
          membershipStatus: 'Active',
        }),
      });
      const created = await createRes.json();
      if (!createRes.ok || !created.success || created.member?.packageType !== 'Trial Plan') {
        throw new Error(`Failed to register valid Trial Plan member: ${JSON.stringify(created)}`);
      }

      // Filter by Trial Plan returns member
      const filterRes = await fetch(`${BASE}/members?packageType=Trial+Plan`, {
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      const filterData = await filterRes.json();
      if (!filterRes.ok || !filterData.members.some((m) => m.memberId === trialMemberId)) {
        throw new Error('Filtering by packageType=Trial Plan failed to include created member');
      }

      // Dashboard metrics include trialMembers
      const metricsRes = await fetch(`${BASE}/dashboard/metrics`, {
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      const metricsData = await metricsRes.json();
      const met = metricsData.metrics || metricsData;
      if (typeof met.trialMembers !== 'number' || met.trialMembers < 1) {
        throw new Error(`Expected trialMembers >= 1 in metrics, got ${met.trialMembers}`);
      }
    });

    // 2. Flexible Member ID Login
    await check('Flexible Member ID login (exact, lowercase, trimmed, hyphenless) and wrong-password rejection', async () => {
      for (const variant of [trialMemberId, 'nwt-tr-831', '  nwt-tr-831  ', 'NWTTR831', 'nwttr831']) {
        const loginRes = await fetch(`${BASE}/auth/member/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ memberId: variant, password: trialMemberInitialPassword }),
        });
        const loginData = await loginRes.json();
        if (!loginRes.ok || !loginData.token || loginData.user?.memberId !== trialMemberId) {
          throw new Error(`Member login failed for variant '${variant}': ${JSON.stringify(loginData)}`);
        }
      }

      const badPassRes = await fetch(`${BASE}/auth/member/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ memberId: 'NWTTR831', password: 'WrongPassword999!' }),
      });
      if (badPassRes.status !== 401) {
        throw new Error(`Expected 401 for wrong member password, got ${badPassRes.status}`);
      }
    });

    // 3. Manual Registration Date Persistence
    await check('Manual Registration Date update persists cleanly while keeping createdAt immutable', async () => {
      const beforeRes = await fetch(`${BASE}/members/${trialMemberId}`, {
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      const beforeData = await beforeRes.json();
      const originalCreatedAt = beforeData.member?.createdAt;

      const patchRes = await fetch(`${BASE}/members/${trialMemberId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${adminToken}` },
        body: JSON.stringify({ registrationDate: '2025-04-15' }),
      });
      const patchData = await patchRes.json();
      if (!patchRes.ok || !String(patchData.member?.registrationDate || '').startsWith('2025-04-15')) {
        throw new Error(`Registration date update failed: ${JSON.stringify(patchData)}`);
      }
      if (originalCreatedAt && patchData.member.createdAt !== originalCreatedAt) {
        throw new Error('Immutable createdAt was modified');
      }
      if (patchData.member.productPrice !== 4500 || patchData.member.packageType !== 'Trial Plan') {
        throw new Error('Unrelated member fields were unexpectedly altered');
      }

      const afterRes = await fetch(`${BASE}/members/${trialMemberId}`, {
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      const afterData = await afterRes.json();
      if (!String(afterData.member?.registrationDate || '').startsWith('2025-04-15')) {
        throw new Error(`Persisted registrationDate mismatch on GET: ${afterData.member?.registrationDate}`);
      }
    });

    // 4. Dedicated 2-Step Member Forgot Password Workflow & Staff Separation
    await check('2-Step Member Forgot Password validation, mismatch rejection, reset, re-login, and staff separation', async () => {
      // Invalid email format -> 400
      const badFormatRes = await fetch(`${BASE}/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ memberId: trialMemberId, email: 'not-an-email' }),
      });
      if (badFormatRes.status !== 400) {
        throw new Error(`Expected 400 for invalid email format, got ${badFormatRes.status}`);
      }

      // Unmatched email -> matched: false without leaking registered email
      const mismatchRes = await fetch(`${BASE}/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ memberId: trialMemberId, email: 'wrong.email@example.com' }),
      });
      const mismatchData = await mismatchRes.json();
      if (mismatchData.matched !== false || JSON.stringify(mismatchData).includes(trialMemberEmail)) {
        throw new Error(`Expected matched:false without leaking registered email: ${JSON.stringify(mismatchData)}`);
      }

      // Matching Member ID (hyphenless) + registered email -> matched: true + reset token
      const matchRes = await fetch(`${BASE}/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ memberId: 'nwttr831', email: trialMemberEmail }),
      });
      const matchData = await matchRes.json();
      if (!matchRes.ok || matchData.matched !== true || !matchData.token) {
        throw new Error(`Expected matched:true with reset token: ${JSON.stringify(matchData)}`);
      }

      // Reset password
      const newPassword = 'ResetMemberPassword2026!';
      const resetRes = await fetch(`${BASE}/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: matchData.token, password: newPassword }),
      });
      const resetData = await resetRes.json();
      if (!resetRes.ok || !resetData.success) {
        throw new Error(`Reset password failed: ${JSON.stringify(resetData)}`);
      }

      // Re-login with new password succeeds
      const newLoginRes = await fetch(`${BASE}/auth/member/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ memberId: trialMemberId, password: newPassword }),
      });
      if (!newLoginRes.ok) {
        throw new Error(`Member login failed with newly reset password (status ${newLoginRes.status})`);
      }

      // Old password fails with 401
      const oldLoginRes = await fetch(`${BASE}/auth/member/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ memberId: trialMemberId, password: trialMemberInitialPassword }),
      });
      if (oldLoginRes.status !== 401) {
        throw new Error(`Expected 401 with old password after reset, got ${oldLoginRes.status}`);
      }

      // Staff forgot password remains independent
      const staffRes = await fetch(`${BASE}/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'staff@nexworldtravel.com' }),
      });
      const staffData = await staffRes.json();
      if (!staffRes.ok || !staffData.success) {
        throw new Error(`Staff forgot password failed: ${JSON.stringify(staffData)}`);
      }
    });

    console.log(`\n--- Client Corrections Suite Completed: ${failures === 0 ? 'ALL TESTS PASSED 🎉' : `${failures} TESTS FAILED`} ---`);
  } finally {
    server.close();
  }

  if (failures > 0) process.exit(1);
}

runClientCorrectionTests();
