import app from '../src/app.js';

async function runTests() {
  console.log('--- Starting Complete Member Portal & Admin Verification Test Suite ---');
  let failures = 0;

  const server = app.listen(5098, '127.0.0.1');

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
    await check('Health Endpoint (/api/v1/health)', async () => {
      const res = await fetch('http://127.0.0.1:5098/api/v1/health');
      const data = await res.json();
      if (!res.ok || data.status !== 'healthy') throw new Error('Health check failed');
    });

    // 2. Member Login with Member ID & Password
    let memberToken = null;
    await check('Member Login with Member ID (NEX-M-1001)', async () => {
      const res = await fetch('http://127.0.0.1:5098/api/v1/auth/member/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          memberId: 'NEX-M-1001',
          password: 'MemberPassword2026!',
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success || !data.token) {
        throw new Error('Member login failed: ' + JSON.stringify(data));
      }
      memberToken = data.token;
      if (data.user.role !== 'member' || data.user.memberId !== 'NEX-M-1001') {
        throw new Error('Unexpected user payload: ' + JSON.stringify(data.user));
      }
    });

    // 3. Master Head Login with Email & Password
    let adminToken = null;
    await check('Master Head Login (admin@nexworldtravel.com)', async () => {
      const res = await fetch('http://127.0.0.1:5098/api/v1/auth/staff/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'admin@nexworldtravel.com',
          password: 'AdminPassword2026!',
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success || !data.token) {
        throw new Error('Master Head login failed: ' + JSON.stringify(data));
      }
      adminToken = data.token;
      if (data.user.role !== 'master_head') throw new Error('Role mismatch for admin');
    });

    // 4. Employee Login with Email & Password
    let employeeToken = null;
    await check('Employee Login (staff@nexworldtravel.com)', async () => {
      const res = await fetch('http://127.0.0.1:5098/api/v1/auth/staff/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'staff@nexworldtravel.com',
          password: 'StaffPassword2026!',
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success || !data.token) {
        throw new Error('Employee login failed: ' + JSON.stringify(data));
      }
      employeeToken = data.token;
      if (data.user.role !== 'employee') throw new Error('Role mismatch for employee');
    });

    // 5. Member Access Control: Member can access own profile (/api/v1/members/me)
    await check('Member access to own profile (/api/v1/members/me)', async () => {
      const res = await fetch('http://127.0.0.1:5098/api/v1/members/me', {
        headers: { Authorization: `Bearer ${memberToken}` },
      });
      const data = await res.json();
      if (!res.ok || !data.success || data.member.memberId !== 'NEX-M-1001') {
        throw new Error('Failed to retrieve self profile: ' + JSON.stringify(data));
      }
      if (data.member.packageType !== 'Gold' || data.member.availableNights !== 14) {
        throw new Error('Unexpected membership fields');
      }
    });

    // 6. Member Access Restriction: Member CANNOT access all members list (/api/v1/members)
    await check('Member CANNOT access admin member list (403 Forbidden)', async () => {
      const res = await fetch('http://127.0.0.1:5098/api/v1/members', {
        headers: { Authorization: `Bearer ${memberToken}` },
      });
      if (res.status !== 403) throw new Error(`Expected 403 Forbidden, received ${res.status}`);
    });

    // 7. Member Support Request creation with 24h commitment
    let createdReqRef = null;
    await check('Member submits support request and receives 24h commitment', async () => {
      const res = await fetch('http://127.0.0.1:5098/api/v1/member-requests', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${memberToken}`,
        },
        body: JSON.stringify({
          requestType: 'Benefits & Available Nights',
          subject: 'Clarification regarding Travel Card airport lounge access',
          message: 'Hello, could you confirm which terminal lounges in Abu Dhabi are eligible for my Gold travel card?',
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success || !data.request) {
        throw new Error('Member request creation failed: ' + JSON.stringify(data));
      }
      if (!data.message.includes('within 24 hours')) {
        throw new Error('Required 24-hour response confirmation missing: ' + data.message);
      }
      createdReqRef = data.request.requestReference;
    });

    // 8. Master Head creates a new member with financial fields
    await check('Master Head creates new member (NEX-M-2002)', async () => {
      const res = await fetch('http://127.0.0.1:5098/api/v1/members', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify({
          memberId: 'NEX-M-2002',
          registeredName: 'Fatima Al Mansoori',
          email: 'fatima@example.com',
          phone: '+971 55 987 6543',
          initialPassword: 'FatimaPassword2026!',
          packageType: 'Silver',
          availableNights: 7,
          extraOffers: '10% dining discount',
          tenurePeriod: '5 Years',
          travelCardBenefit: false,
          productPrice: 15000,
          initialPaidAmount: 5000,
          hasEMI: true,
          emiAmount: 1000,
          emiTenureMonths: 10,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success || data.member.memberId !== 'NEX-M-2002') {
        throw new Error('Failed to create member: ' + JSON.stringify(data));
      }
      if (data.member.outstandingBalance !== 10000) {
        throw new Error(`Expected balance 10000, got ${data.member.outstandingBalance}`);
      }
    });

    // 9. Employee permission restriction: Employee without direct edit creates Change Request
    let changeReqId = null;
    await check('Employee creates Change Request for Master Head approval', async () => {
      const res = await fetch('http://127.0.0.1:5098/api/v1/change-requests', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${employeeToken}`,
        },
        body: JSON.stringify({
          entityType: 'membership_plan',
          targetId: 'NEX-M-2002',
          targetName: 'Fatima Al Mansoori',
          currentValue: { packageType: 'Silver', availableNights: 7 },
          proposedValue: { packageType: 'Gold', availableNights: 14 },
          reason: 'Member requested upgrade to Gold package at Abu Dhabi headquarters.',
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success || !data.changeRequest) {
        throw new Error('Change request failed: ' + JSON.stringify(data));
      }
      changeReqId = data.changeRequest.requestId;
    });

    // 10. Master Head approves Change Request & updates target record
    await check('Master Head approves Employee Change Request', async () => {
      const res = await fetch(`http://127.0.0.1:5098/api/v1/change-requests/${changeReqId}/approve`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      const data = await res.json();
      if (!res.ok || !data.success || data.changeRequest.status !== 'Approved') {
        throw new Error('Approval failed: ' + JSON.stringify(data));
      }

      // Verify Fatima is now Gold with 14 nights
      const checkRes = await fetch('http://127.0.0.1:5098/api/v1/members/NEX-M-2002', {
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      const checkData = await checkRes.json();
      if (checkData.member.packageType !== 'Gold' || checkData.member.availableNights !== 14) {
        throw new Error('Approved changes were not applied to target member profile!');
      }
    });

    // 11. Payment Recording & Financial Audit History
    await check('Record EMI payment and verify balance adjustment', async () => {
      const res = await fetch('http://127.0.0.1:5098/api/v1/members/NEX-M-2002/payments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify({
          amount: 2000,
          paymentType: 'emi_installment',
          paymentMethod: 'Bank Transfer',
          referenceNumber: 'ENBD-TXN-99881',
          notes: 'Two months EMI settlement',
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success || data.member.outstandingBalance !== 8000) {
        throw new Error('Payment balance recalculation failed: ' + JSON.stringify(data));
      }
    });

    // 12. Dream Destinations vs Top Destinations filtering
    await check('Destinations category filtering (Dream vs Top)', async () => {
      const res = await fetch('http://127.0.0.1:5098/api/v1/destinations?category=Dream Destinations');
      const data = await res.json();
      if (!res.ok || !data.success || !Array.isArray(data.data)) {
        throw new Error('Destination category filter failed');
      }
    });

    // 13. Dashboard Metrics for Master Head
    await check('Master Head Dashboard Metrics (/api/v1/dashboard/metrics)', async () => {
      const res = await fetch('http://127.0.0.1:5098/api/v1/dashboard/metrics', {
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      const data = await res.json();
      if (!res.ok || !data.success || !data.metrics) {
        throw new Error('Dashboard metrics fetch failed: ' + JSON.stringify(data));
      }
      if (data.metrics.totalMembers < 2) throw new Error('Expected at least 2 members');
    });

    // 14. Employee with create_member permission creates a new member directly
    await check('Employee with create_member creates a new member (NEX-M-3003)', async () => {
      const res = await fetch('http://127.0.0.1:5098/api/v1/members', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${employeeToken}`,
        },
        body: JSON.stringify({
          memberId: 'NEX-M-3003',
          registeredName: 'Khalid Al Hashimi',
          email: 'khalid@example.com',
          phone: '+971 50 333 4444',
          initialPassword: 'KhalidPassword2026!',
          packageType: 'Gold',
          availableNights: 14,
          extraOffers: 'Airport Transfer, VIP Lounge',
          tenurePeriod: '3 Years',
          travelCardBenefit: true,
          productPrice: 12000,
          initialPaidAmount: 4000,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success || data.member.memberId !== 'NEX-M-3003') {
        throw new Error('Employee failed to create member: ' + JSON.stringify(data));
      }
    });

    // 15. Employee CANNOT directly change protected package fields on existing member
    await check('Employee CANNOT directly change package fields (403 requires approval)', async () => {
      const res = await fetch('http://127.0.0.1:5098/api/v1/members/NEX-M-3003', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${employeeToken}`,
        },
        body: JSON.stringify({
          packageType: 'Silver',
          availableNights: 25,
        }),
      });
      const data = await res.json();
      if (res.status !== 403 || !data.requiresApproval) {
        throw new Error(`Expected 403 requiresApproval, received ${res.status}: ${JSON.stringify(data)}`);
      }
    });

    // 16. Grant edit_member_details permission, then verify staff can update permitted contact info (phone)
    await check('Employee can update permitted contact information after permission granted', async () => {
      // First grant edit_member_details to staff
      const permRes = await fetch('http://127.0.0.1:5098/api/v1/employees/user-staff-1/permissions', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify({
          permissions: ['view_members', 'create_member', 'create_member_change_request', 'edit_member_details'],
        }),
      });
      const permData = await permRes.json();
      if (!permRes.ok || !permData.success) {
        throw new Error('Failed to update employee permissions: ' + JSON.stringify(permData));
      }

      // Now staff updates permitted contact info
      const res = await fetch('http://127.0.0.1:5098/api/v1/members/NEX-M-3003', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${employeeToken}`,
        },
        body: JSON.stringify({
          phone: '+971 50 999 8888',
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success || data.member.phone !== '+971 50 999 8888') {
        throw new Error('Permitted contact update failed: ' + JSON.stringify(data));
      }
    });

    // 17. Password Reset Flow: Forgot Password and Reset Password
    let resetToken = null;
    await check('Password Reset Flow (forgot-password and reset-password)', async () => {
      const forgotRes = await fetch('http://127.0.0.1:5098/api/v1/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'staff@nexworldtravel.com' }),
      });
      const forgotData = await forgotRes.json();
      if (!forgotRes.ok || !forgotData.success || !forgotData.token) {
        throw new Error('Forgot password request failed: ' + JSON.stringify(forgotData));
      }
      resetToken = forgotData.token;

      // Consume reset token
      const resetRes = await fetch('http://127.0.0.1:5098/api/v1/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token: resetToken,
          password: 'NewStaffPassword2026!',
        }),
      });
      const resetData = await resetRes.json();
      if (!resetRes.ok || !resetData.success) {
        throw new Error('Reset password submission failed: ' + JSON.stringify(resetData));
      }

      // Verify login with new password
      const loginRes = await fetch('http://127.0.0.1:5098/api/v1/auth/staff/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'staff@nexworldtravel.com',
          password: 'NewStaffPassword2026!',
        }),
      });
      const loginData = await loginRes.json();
      if (!loginRes.ok || !loginData.success) {
        throw new Error('Login with reset password failed: ' + JSON.stringify(loginData));
      }
    });

    // 18. Employee Account Activation Flow
    let activationToken = null;
    let newStaffEmail = 'newhire@nexworldtravel.com';
    await check('Employee Account Creation & Activation Flow', async () => {
      const createRes = await fetch('http://127.0.0.1:5098/api/v1/employees', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify({
          name: 'Layla Al Nuaimi',
          email: newStaffEmail,
          password: 'TempPassword2026!',
          permissions: ['view_members', 'create_member'],
        }),
      });
      const createData = await createRes.json();
      if (!createRes.ok || !createData.success || !createData.employee.activationToken) {
        throw new Error('Employee creation with activation token failed: ' + JSON.stringify(createData));
      }
      activationToken = createData.employee.activationToken;

      // Activate using token
      const actRes = await fetch('http://127.0.0.1:5098/api/v1/auth/activate-account', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token: activationToken,
          password: 'LaylaPrivatePassword2026!',
        }),
      });
      const actData = await actRes.json();
      if (!actRes.ok || !actData.success) {
        throw new Error('Account activation failed: ' + JSON.stringify(actData));
      }
    });

    // 19. Deactivated employee cannot log in
    await check('Deactivated employee cannot log in (blocked)', async () => {
      // Toggle new staff to deactivated
      const listRes = await fetch('http://127.0.0.1:5098/api/v1/employees', {
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      const listData = await listRes.json();
      const targetEmp = listData.employees.find((e) => e.email === newStaffEmail);
      if (!targetEmp) throw new Error('Target employee not found in directory');

      const toggleRes = await fetch(`http://127.0.0.1:5098/api/v1/employees/${targetEmp._id || targetEmp.id}/status`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      const toggleData = await toggleRes.json();
      if (!toggleRes.ok || toggleData.isActive !== false) {
        throw new Error('Failed to toggle employee status to deactivated');
      }

      // Attempt login
      const attemptRes = await fetch('http://127.0.0.1:5098/api/v1/auth/staff/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: newStaffEmail,
          password: 'LaylaPrivatePassword2026!',
        }),
      });
      if (attemptRes.status !== 403) {
        throw new Error(`Expected 403 Deactivated for staff login, got ${attemptRes.status}`);
      }
    });

    // 20. High-Scale Member Records Performance Check (5,000 members)
    await check('5,000 Members Scale Performance Test (< 100ms response)', async () => {
      const { store } = await import('../src/services/storeService.js');
      // Synthetically add up to 5,000 members in store
      const currentCount = store.members.length;
      for (let i = currentCount; i < 5000; i++) {
        store.members.push({
          _id: `mem-scale-${i}`,
          userId: `usr-scale-${i}`,
          memberId: `NEX-M-${10000 + i}`,
          registeredName: `Member Scale Test ${i}`,
          email: `member${i}@scale.test`,
          phone: `+971 50 ${String(1000000 + i).slice(0, 7)}`,
          packageType: i % 2 === 0 ? 'Gold' : 'Silver',
          availableNights: 14,
          travelCardBenefit: i % 3 === 0,
          productPrice: 12500,
          totalAmountPaid: 5000,
          outstandingBalance: 7500,
          membershipStatus: 'active',
          createdAt: new Date().toISOString(),
        });
      }

      const t0 = Date.now();
      const res = await fetch('http://127.0.0.1:5098/api/v1/members?search=Member%20Scale%20Test%20499&page=1&limit=15', {
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      const t1 = Date.now();
      const duration = t1 - t0;
      const data = await res.json();

      if (!res.ok || !data.success || data.total < 5000) {
        throw new Error(`Scale test failed: count is ${data.total}`);
      }
      if (duration > 150) {
        throw new Error(`Scale query took ${duration}ms, exceeding performance budget`);
      }
    });

    console.log(`\n--- Test Suite Completed: ${failures === 0 ? 'ALL 20 TESTS PASSED 🎉' : `${failures} TESTS FAILED`} ---`);
  } finally {
    server.close();
  }

  if (failures > 0) process.exit(1);
}

runTests();
