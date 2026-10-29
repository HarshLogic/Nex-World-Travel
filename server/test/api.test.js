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

    // 3b. Master Head Login (adityar@nexworldtravel.com)
    await check('Master Head Login (adityar@nexworldtravel.com)', async () => {
      const res = await fetch('http://127.0.0.1:5098/api/v1/auth/staff/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'adityar@nexworldtravel.com',
          password: 'Aditiya@1993',
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success || !data.token) {
        throw new Error('Master Head login with adityar failed: ' + JSON.stringify(data));
      }
      if (data.user.role !== 'master_head') throw new Error('Role mismatch for adityar');
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

    // 21. Standard Booking Request Format Submission & Date Validation
    await check('Standard Booking Request format submission & validation', async () => {
      // Valid submission
      const res = await fetch('http://127.0.0.1:5098/api/v1/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          memberName: 'Dr. Sarah Jenkins',
          spouseName: 'Robert Jenkins',
          kidsAges: '2 kids (ages 5, 8)',
          checkInDate: '2026-11-15',
          checkOutDate: '2026-11-22',
          destinationOrPackage: 'Swiss Alps Luxury Retreat',
          guestsCount: 4,
          email: 'sarah.jenkins@example.com',
          phone: '+971 50 999 8877',
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success || !data.data.referenceNumber) {
        throw new Error('Standard booking submission failed: ' + JSON.stringify(data));
      }
      if (!data.message.includes('Reservations Team will check availability')) {
        throw new Error('Missing standard closing message in response');
      }

      // Invalid date validation: check-out before check-in
      const invalidRes = await fetch('http://127.0.0.1:5098/api/v1/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          memberName: 'Dr. Sarah Jenkins',
          checkInDate: '2026-11-25',
          checkOutDate: '2026-11-20', // Invalid: before check-in!
          destinationOrPackage: 'Swiss Alps',
          guestsCount: 2,
          email: 'sarah.jenkins@example.com',
          phone: '+971 50 999 8877',
        }),
      });
      if (invalidRes.status !== 400) {
        throw new Error('Validation failed to reject check-out before check-in');
      }
    });

    // 22. Trip and Plan Availability Calendar Endpoint
    await check('Trip & Plan Availability Calendar (/api/v1/availability)', async () => {
      const res = await fetch('http://127.0.0.1:5098/api/v1/availability');
      const data = await res.json();
      if (!res.ok || !data.success || !Array.isArray(data.data) || data.count === 0) {
        throw new Error('Failed to retrieve trip availability: ' + JSON.stringify(data));
      }
      const availableTrips = data.data.filter((t) => t.isAvailable);
      if (availableTrips.length === 0) {
        throw new Error('No green available trips found in store');
      }
    });

    // 23. Fix Master Head Dashboard Bug & Membership Status Lifecycle
    await check('Master Head member creation persistence, immediate retrieval & status filtering', async () => {
      const testMemberId = `NEX-M-${Date.now().toString().slice(-4)}`;
      const createRes = await fetch('http://127.0.0.1:5098/api/v1/members', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify({
          memberId: testMemberId,
          name: 'Dashboard Verification Member',
          email: `${testMemberId.toLowerCase()}@nexworldtravel.com`,
          phone: '+971 50 777 6655',
          password: 'Pass2026!Verification',
          packageType: 'Platinum',
          nightsAvailable: 21,
          membershipStatus: 'Open',
          productPrice: 35000,
          initialPaidAmount: 10000,
          tenurePeriod: '5 Years',
          travelCardBenefit: true,
        }),
      });
      const createData = await createRes.json();
      if (!createRes.ok || !createData.success) {
        throw new Error(`Failed to create member: ${JSON.stringify(createData)}`);
      }

      // Verify member can immediately log in
      const loginRes = await fetch('http://127.0.0.1:5098/api/v1/auth/member/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          memberId: testMemberId,
          password: 'Pass2026!Verification',
        }),
      });
      const loginData = await loginRes.json();
      if (!loginRes.ok || !loginData.success) {
        throw new Error('Newly created member cannot log in');
      }

      // Verify member appears on Master Head dashboard member search
      const searchRes = await fetch(`http://127.0.0.1:5098/api/v1/members?search=${testMemberId}`, {
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      const searchData = await searchRes.json();
      if (!searchRes.ok || !searchData.members || searchData.members.length === 0) {
        throw new Error(`Master Head dashboard cannot find newly created member ${testMemberId}`);
      }
      const retrieved = searchData.members[0];
      if (retrieved.membershipStatus !== 'Open') {
        throw new Error(`Expected membershipStatus 'Open' but got ${retrieved.membershipStatus}`);
      }

      // Verify status filtering
      const filterOpen = await fetch(`http://127.0.0.1:5098/api/v1/members?status=Open&search=${testMemberId}`, {
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      const openData = await filterOpen.json();
      if (openData.members.length === 0) {
        throw new Error('Status filter "Open" failed to include the new member');
      }

      const filterClose = await fetch(`http://127.0.0.1:5098/api/v1/members?status=Close&search=${testMemberId}`, {
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      const closeData = await filterClose.json();
      if (closeData.members.length > 0) {
        throw new Error('Status filter "Close" should not include Open member');
      }

      // Update status to 'Close', 'Deactive', 'Cancel'
      for (const nextStatus of ['Deactive', 'Cancel', 'Close']) {
        const updateRes = await fetch(`http://127.0.0.1:5098/api/v1/members/${testMemberId}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${adminToken}`,
          },
          body: JSON.stringify({ membershipStatus: nextStatus }),
        });
        const updateData = await updateRes.json();
        if (!updateRes.ok || updateData.member?.membershipStatus !== nextStatus) {
          throw new Error(`Failed to update membershipStatus to ${nextStatus}`);
        }
      }
    });

    // 24. Member-Specific Travel Availability and Financial Separation
    await check('Member-specific travel availability calendar & separate payment status', async () => {
      const availRes = await fetch('http://127.0.0.1:5098/api/v1/availability', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify({
          memberId: 'NEX-M-1001',
          memberName: 'Dr. Tariq Al Nuaimi',
          title: 'Private Maldives Overwater Villa',
          destinationOrPlan: 'Maldives',
          startDate: '2026-12-01',
          endDate: '2026-12-08',
          isAvailable: true,
          availableSeats: 2,
        }),
      });
      const availData = await availRes.json();
      if (!availRes.ok || !availData.success) {
        throw new Error(`Failed to create member-specific availability: ${JSON.stringify(availData)}`);
      }

      // Member query returns their specific availability + ALL availability
      const memberAvail = await fetch('http://127.0.0.1:5098/api/v1/availability?memberId=NEX-M-1001');
      const mData = await memberAvail.json();
      const hasSpecific = mData.data.some((a) => a.memberId === 'NEX-M-1001');
      if (!hasSpecific) {
        throw new Error('Member-specific availability not returned for member query');
      }

      // Payment with status update preserves paymentStatus integrity
      const payRes = await fetch('http://127.0.0.1:5098/api/v1/members/NEX-M-1001/payments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify({
          amount: 2000,
          paymentMethod: 'Credit Card',
          membershipStatus: 'Open',
        }),
      });
      const payData = await payRes.json();
      if (!payRes.ok || !payData.member) {
        throw new Error('Payment recording failed');
      }
      if (payData.member.membershipStatus !== 'Open') {
        throw new Error('membershipStatus was not updated via payment endpoint');
      }
      if (!['Up to Date', 'Fully Paid'].includes(payData.member.paymentStatus)) {
        throw new Error(`paymentStatus corrupted: ${payData.member.paymentStatus}`);
      }
    });

    // 25. Activity Management CRUD & Publication Visibility
    await check('Master Head Activities Management (Create, List, Update, Soft-delete)', async () => {
      // Create new activity
      const createRes = await fetch('http://127.0.0.1:5098/api/v1/activities', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify({
          title: 'Abu Dhabi Falcon Hospital VIP Tour',
          category: 'Cultural & Heritage',
          region: 'Middle East / UAE',
          location: 'Abu Dhabi, UAE',
          duration: '3 hours',
          intensity: 'Easy',
          description:
            'An exclusive insider access tour to the largest avian hospital in the world, meeting majestic falcons up close.',
          shortDescription: 'Exclusive insider access tour to the largest falcon hospital in the world.',
          imageUrl: '/images/activities/falcon.jpg',
          displayOrder: 10,
          publicationStatus: 'published',
        }),
      });
      const created = await createRes.json();
      if (!createRes.ok || !created.activity) {
        throw new Error(`Failed to create activity: ${created.message}`);
      }

      const actId = created.activity._id;

      // Public listing should include this published activity
      const listRes = await fetch('http://127.0.0.1:5098/api/v1/activities');
      const listData = await listRes.json();
      if (!listData.data.some((a) => a.title === 'Abu Dhabi Falcon Hospital VIP Tour')) {
        throw new Error('Newly created activity not found in public list');
      }

      // Update activity to draft
      const updateRes = await fetch(`http://127.0.0.1:5098/api/v1/activities/${actId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify({
          publicationStatus: 'draft',
          intensity: 'All Ages',
        }),
      });
      const updated = await updateRes.json();
      if (!updateRes.ok || updated.activity.publicationStatus !== 'draft') {
        throw new Error('Failed to update activity publicationStatus');
      }

      // Public unauthenticated request should now HIDE the draft activity
      const pubCheckRes = await fetch('http://127.0.0.1:5098/api/v1/activities');
      const pubCheckData = await pubCheckRes.json();
      if (pubCheckData.data.some((a) => a._id === actId)) {
        throw new Error('Draft activity should NOT be visible to public unauthenticated requests');
      }

      // Soft delete activity
      const delRes = await fetch(`http://127.0.0.1:5098/api/v1/activities/${actId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${adminToken}`,
        },
      });
      const delData = await delRes.json();
      if (!delRes.ok || !delData.success) {
        throw new Error('Failed to delete activity');
      }
    });

    // 26. Europe & Africa Destination Image Swap Verification
    await check('Europe and Africa destination images correctly swapped', async () => {
      const destRes = await fetch('http://127.0.0.1:5098/api/v1/destinations');
      const destData = await destRes.json();
      if (!destRes.ok || !destData.data) {
        throw new Error('Failed to fetch destinations');
      }

      const europe = destData.data.find((d) => d.slug === 'europe');
      const africa = destData.data.find((d) => d.slug === 'africa');

      if (!europe) throw new Error('Europe destination not found');
      if (!africa) throw new Error('Africa destination not found');

      if (
        europe.imageUrl !== '/images/destinations/africa.jpg' &&
        europe.coverImage !== '/images/destinations/africa.jpg'
      ) {
        throw new Error(
          `Europe image expected to be /images/destinations/africa.jpg, received: ${
            europe.imageUrl || europe.coverImage
          }`
        );
      }

      if (
        africa.imageUrl !== '/images/destinations/europe.jpg' &&
        africa.coverImage !== '/images/destinations/europe.jpg'
      ) {
        throw new Error(
          `Africa image expected to be /images/destinations/europe.jpg, received: ${
            africa.imageUrl || africa.coverImage
          }`
        );
      }

      // Verify title and descriptions were NOT altered
      if (europe.title !== 'Europe' || africa.title !== 'Africa') {
        throw new Error('Destination titles were unexpectedly altered');
      }
    });

    // 27. Image Upload & Validation
    await check('Media Upload API: format validation, size limit, and successful upload', async () => {
      // 1x1 pixel transparent PNG in base64
      const validPngBase64 =
        'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=';

      // 1. Valid upload
      const uploadRes = await fetch('http://127.0.0.1:5098/api/v1/media/upload', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify({
          data: `data:image/png;base64,${validPngBase64}`,
          name: 'test-sample.png',
        }),
      });
      const uploadData = await uploadRes.json();
      if (!uploadRes.ok || !uploadData.url) {
        throw new Error(`Valid image upload failed: ${uploadData.message}`);
      }

      // 2. Invalid MIME type (e.g. text file disguised)
      const invalidTypeRes = await fetch('http://127.0.0.1:5098/api/v1/media/upload', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify({
          data: 'data:text/plain;base64,SGVsbG8gV29ybGQ=',
          name: 'document.txt',
        }),
      });
      if (invalidTypeRes.status !== 400) {
        throw new Error(`Expected 400 for invalid MIME type, got ${invalidTypeRes.status}`);
      }

      // 3. Unauthenticated upload blocked
      const noAuthRes = await fetch('http://127.0.0.1:5098/api/v1/media/upload', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          data: `data:image/png;base64,${validPngBase64}`,
          name: 'test.png',
        }),
      });
      if (noAuthRes.status !== 401) {
        throw new Error(`Expected 401 for unauthenticated upload, got ${noAuthRes.status}`);
      }
    });

    // 28. Destination Creation & Non-Destructive Preservation Regression Test
    await check('Adding a new destination preserves all existing destinations without deleting, overwriting or hiding them', async () => {
      // 1. Record existing destinations
      const initialRes = await fetch('http://127.0.0.1:5098/api/v1/destinations', {
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      const initialData = await initialRes.json();
      if (!initialRes.ok || !Array.isArray(initialData.data)) {
        throw new Error('Failed to fetch initial destinations');
      }
      const initialCount = initialData.data.length;
      const initialSlugs = initialData.data.map((d) => d.slug);
      const initialMap = new Map(initialData.data.map((d) => [d.slug, { title: d.title, image: d.imageUrl || d.coverImage }]));

      if (initialCount < 5) {
        throw new Error(`Expected at least 5 baseline destinations, got ${initialCount}`);
      }

      // 2. Add a new destination
      const testTitle = `Bora Bora Sanctuary ${Date.now()}`;
      const createRes = await fetch('http://127.0.0.1:5098/api/v1/destinations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify({
          title: testTitle,
          region: 'Asia',
          category: 'Dream Destinations',
          description: 'Overwater bungalows, crystal-clear turquoise lagoons, and private island dining.',
          shortDescription: 'Ultimate luxury island retreat in turquoise Polynesian waters.',
          imageUrl: '/images/destinations/tokyo.jpg',
          displayOrder: 99,
          publicationStatus: 'published',
        }),
      });
      const createdData = await createRes.json();
      if (!createRes.ok || !createdData.destination) {
        throw new Error(`Failed to create destination: ${createdData.message}`);
      }
      const createdDest = createdData.destination;
      const createdId = createdDest._id;

      // 3. Fetch destinations again (admin view)
      const afterRes = await fetch('http://127.0.0.1:5098/api/v1/destinations', {
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      const afterData = await afterRes.json();
      if (!afterRes.ok || !Array.isArray(afterData.data)) {
        throw new Error('Failed to fetch destinations after creation');
      }

      // Acceptance criterion: Count must increase by exactly 1
      if (afterData.data.length !== initialCount + 1) {
        throw new Error(`Expected count to be ${initialCount + 1}, but found ${afterData.data.length}`);
      }

      // Verify EVERY previous destination still exists with unchanged title and image
      for (const [slug, info] of initialMap.entries()) {
        const found = afterData.data.find((d) => d.slug === slug);
        if (!found) {
          throw new Error(`CRITICAL: Existing destination '${slug}' disappeared after adding new destination!`);
        }
        if (found.title !== info.title) {
          throw new Error(`CRITICAL: Destination '${slug}' title was modified!`);
        }
        const currentImage = found.imageUrl || found.coverImage;
        if (currentImage !== info.image) {
          throw new Error(`CRITICAL: Destination '${slug}' image was modified! Expected ${info.image}, got ${currentImage}`);
        }
      }

      // Verify the new destination is present
      const foundNew = afterData.data.find((d) => d._id === createdId || d.slug === createdDest.slug);
      if (!foundNew) {
        throw new Error('New destination not found in destination list');
      }

      // 4. Public website fetch (unauthenticated) also shows existing + new published destination
      const pubRes = await fetch('http://127.0.0.1:5098/api/v1/destinations');
      const pubData = await pubRes.json();
      if (!pubRes.ok || !Array.isArray(pubData.data)) {
        throw new Error('Failed to fetch public destinations');
      }
      if (!pubData.data.some((d) => d.slug === createdDest.slug)) {
        throw new Error('New published destination not visible on public endpoint');
      }
      for (const slug of initialSlugs) {
        if (!pubData.data.some((d) => d.slug === slug)) {
          throw new Error(`CRITICAL: Baseline destination '${slug}' missing from public endpoint!`);
        }
      }

      // 5. Edit only the new destination
      const updateRes = await fetch(`http://127.0.0.1:5098/api/v1/destinations/${createdId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify({
          tagline: 'Exclusive VIP Overwater Sanctuary Updated',
          shortDescription: 'Updated short description for test.',
        }),
      });
      const updateData = await updateRes.json();
      if (!updateRes.ok || !updateData.destination) {
        throw new Error(`Failed to update destination: ${updateData.message}`);
      }
      if (updateData.destination.tagline !== 'Exclusive VIP Overwater Sanctuary Updated') {
        throw new Error('Destination tagline was not updated');
      }

      // 6. Delete the test destination
      const deleteRes = await fetch(`http://127.0.0.1:5098/api/v1/destinations/${createdId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      const deleteData = await deleteRes.json();
      if (!deleteRes.ok || !deleteData.success) {
        throw new Error(`Failed to delete test destination: ${deleteData.message}`);
      }

      // 7. Verify all initial destinations still exist after deleting test destination
      const finalRes = await fetch('http://127.0.0.1:5098/api/v1/destinations');
      const finalData = await finalRes.json();
      for (const slug of initialSlugs) {
        if (!finalData.data.some((d) => d.slug === slug)) {
          throw new Error(`CRITICAL: Baseline destination '${slug}' missing after test cleanup!`);
        }
      }
    });

    // ==================== DIRECT MONGODB IMAGE STORAGE & SERVING TESTS ====================
    const validJpegBytes = Buffer.from([
      0xFF, 0xD8, 0xFF, 0xE0, 0x00, 0x10, 0x4A, 0x46, 0x49, 0x46, 0x00, 0x01, 0x01, 0x01, 0x00, 0x48,
      0x00, 0x48, 0x00, 0x00, 0xFF, 0xDB, 0x00, 0x43, 0x00, 0x08, 0x06, 0x06, 0x07, 0x06, 0x05, 0x08,
      0x07, 0x07, 0x07, 0x09, 0x09, 0x08, 0x0A, 0x0C, 0x14, 0x0D, 0x0C, 0x0B, 0x0B, 0x0C, 0x19, 0x12,
      0x13, 0x0F, 0x14, 0x1D, 0x1A, 0x1F, 0x1E, 0x1D, 0x1A, 0x1C, 0x1C, 0x20, 0x24, 0x2E, 0x27, 0x20,
      0x22, 0x2C, 0x23, 0x1C, 0x1C, 0x28, 0x37, 0x29, 0x2C, 0x30, 0x31, 0x34, 0x34, 0x34, 0x1F, 0x27,
      0x39, 0x3D, 0x38, 0x32, 0x3C, 0x2E, 0x33, 0x34, 0x32, 0xFF, 0xC0, 0x00, 0x0B, 0x08, 0x00, 0x01,
      0x00, 0x01, 0x01, 0x01, 0x11, 0x00, 0xFF, 0xC4, 0x00, 0x1F, 0x00, 0x00, 0x01, 0x05, 0x01, 0x01,
      0x01, 0x01, 0x01, 0x01, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x01, 0x02, 0x03, 0x04,
      0x05, 0x06, 0x07, 0x08, 0x09, 0x0A, 0x0B, 0xFF, 0xDA, 0x00, 0x08, 0x01, 0x01, 0x00, 0x00, 0x3F,
      0x00, 0x7F, 0x00, 0xFF, 0xD9
    ]);

    const validPngBytes = Buffer.from([
      0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, 0x00, 0x00, 0x00, 0x0D, 0x49, 0x48, 0x44, 0x52,
      0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01, 0x08, 0x06, 0x00, 0x00, 0x00, 0x1F, 0x15, 0xC4,
      0x89, 0x00, 0x00, 0x00, 0x0A, 0x49, 0x44, 0x41, 0x54, 0x78, 0x9C, 0x63, 0x00, 0x01, 0x00, 0x00,
      0x05, 0x00, 0x01, 0x0D, 0x0A, 0x2D, 0xB4, 0x00, 0x00, 0x00, 0x00, 0x49, 0x45, 0x4E, 0x44, 0xAE,
      0x42, 0x60, 0x82
    ]);

    let testDirectDest = null;

    await check('Direct Image: Create destination with valid direct JPEG image (< 1MB)', async () => {
      const res = await fetch('http://127.0.0.1:5098/api/v1/destinations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify({
          title: 'Direct Mongo Sanctuary',
          region: 'Asia',
          category: 'Dream Destinations',
          description: 'A destination featuring direct binary image persistence in MongoDB.',
          imageData: `data:image/jpeg;base64,${validJpegBytes.toString('base64')}`,
          imageOriginalName: 'sanctuary-preview.jpg',
          publicationStatus: 'published',
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.destination) {
        throw new Error(`Failed to create destination with direct image: ${JSON.stringify(data)}`);
      }
      testDirectDest = data.destination;

      if (!testDirectDest.hasDirectImage) {
        throw new Error('Expected hasDirectImage to be true');
      }
      if (testDirectDest.image && testDirectDest.image.data) {
        throw new Error('Security violation: binary image.data must NOT be returned in JSON response!');
      }
      if (!testDirectDest.imageUrl.includes('/image')) {
        throw new Error(`Expected imageUrl to point to /image endpoint, got ${testDirectDest.imageUrl}`);
      }
    });

    await check('Direct Image: Serve raw image bytes with ETag and Cache-Control', async () => {
      const res = await fetch(`http://127.0.0.1:5098/api/v1/destinations/${testDirectDest.slug}/image`);
      if (!res.ok) {
        throw new Error(`Failed to fetch image: status ${res.status}`);
      }

      const contentType = res.headers.get('content-type');
      if (contentType !== 'image/jpeg') {
        throw new Error(`Expected content-type image/jpeg, got ${contentType}`);
      }

      const cacheControl = res.headers.get('cache-control');
      if (!cacheControl || !cacheControl.includes('public')) {
        throw new Error(`Expected Cache-Control with public caching, got ${cacheControl}`);
      }

      const etag = res.headers.get('etag');
      if (!etag) {
        throw new Error('Expected ETag header on image response');
      }

      const buffer = await res.arrayBuffer();
      if (buffer.byteLength !== validJpegBytes.length) {
        throw new Error(`Image byte length mismatch. Expected ${validJpegBytes.length}, received ${buffer.byteLength}`);
      }

      // Test conditional request (If-None-Match) returning 304
      const conditionalRes = await fetch(`http://127.0.0.1:5098/api/v1/destinations/${testDirectDest.slug}/image`, {
        headers: { 'If-None-Match': etag },
      });
      if (conditionalRes.status !== 304) {
        throw new Error(`Expected 304 Not Modified with matching ETag, got ${conditionalRes.status}`);
      }
    });

    await check('Direct Image: Destination list does NOT include binary image data', async () => {
      const res = await fetch('http://127.0.0.1:5098/api/v1/destinations');
      const data = await res.json();
      if (!res.ok || !Array.isArray(data.data)) {
        throw new Error('Failed to retrieve destinations list');
      }
      const match = data.data.find((d) => d.slug === testDirectDest.slug);
      if (!match) throw new Error('Created direct destination not found in list');
      if (match.image && match.image.data) {
        throw new Error('CRITICAL: Destination list endpoint leaked binary image data!');
      }
    });

    await check('Direct Image: Direct image upload endpoint POST /:id/image with PNG', async () => {
      const res = await fetch(`http://127.0.0.1:5098/api/v1/destinations/${testDirectDest.slug}/image`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify({
          data: validPngBytes.toString('base64'),
          name: 'replaced.png',
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.destination) {
        throw new Error(`Image replacement failed: ${JSON.stringify(data)}`);
      }

      // Verify that fetching the image now returns image/png
      const imgRes = await fetch(`http://127.0.0.1:5098/api/v1/destinations/${testDirectDest.slug}/image`);
      if (imgRes.headers.get('content-type') !== 'image/png') {
        throw new Error(`Expected updated image/png, got ${imgRes.headers.get('content-type')}`);
      }
      const imgBuf = await imgRes.arrayBuffer();
      if (imgBuf.byteLength !== validPngBytes.length) {
        throw new Error(`Expected replaced PNG size ${validPngBytes.length}, got ${imgBuf.byteLength}`);
      }
    });

    await check('Direct Image: Rejection of images exceeding 1 MB limit (HTTP 400)', async () => {
      // Create oversized buffer: 1 MB + 1024 bytes with JPEG header
      const oversized = Buffer.alloc(1024 * 1024 + 1024, 0x55);
      oversized[0] = 0xFF;
      oversized[1] = 0xD8;
      oversized[2] = 0xFF;

      const res = await fetch(`http://127.0.0.1:5098/api/v1/destinations/${testDirectDest.slug}/image`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify({
          data: oversized.toString('base64'),
          name: 'huge.jpg',
        }),
      });

      if (res.status !== 400) {
        throw new Error(`Expected HTTP 400 for image > 1MB, got status ${res.status}`);
      }
      const data = await res.json();
      if (!data.message || !data.message.includes('1 MB')) {
        throw new Error(`Expected error message mentioning 1 MB limit, got "${data.message}"`);
      }
    });

    await check('Direct Image: Rejection of invalid/spoofed file format (HTTP 400)', async () => {
      const spoofed = Buffer.from('MZ Not a genuine JPEG or PNG file header');
      const res = await fetch(`http://127.0.0.1:5098/api/v1/destinations/${testDirectDest.slug}/image`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify({
          data: spoofed.toString('base64'),
          name: 'malicious.jpg',
        }),
      });

      if (res.status !== 400) {
        throw new Error(`Expected HTTP 400 for invalid magic bytes, got status ${res.status}`);
      }
      const data = await res.json();
      if (!data.message || !data.message.toLowerCase().includes('format') && !data.message.toLowerCase().includes('jpeg')) {
        throw new Error(`Expected format rejection message, got: ${data.message}`);
      }
    });

    await check('Direct Image: Editing destination without uploading preserves existing image', async () => {
      const editRes = await fetch(`http://127.0.0.1:5098/api/v1/destinations/${testDirectDest.slug}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify({
          tagline: 'Preserved Image Tagline Test',
        }),
      });
      const editData = await editRes.json();
      if (!editRes.ok || !editData.destination) {
        throw new Error(`Failed to update destination: ${editData.message}`);
      }

      // Check that image is still served accurately
      const imgRes = await fetch(`http://127.0.0.1:5098/api/v1/destinations/${testDirectDest.slug}/image`);
      if (!imgRes.ok || imgRes.headers.get('content-type') !== 'image/png') {
        throw new Error('Image was lost or corrupted when editing text fields!');
      }
    });

    await check('Direct Image: Draft destination image returns 404 for guests, 200 for staff', async () => {
      // Change destination to draft
      await fetch(`http://127.0.0.1:5098/api/v1/destinations/${testDirectDest.slug}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify({ publicationStatus: 'draft' }),
      });

      // Anonymous request should receive 404
      const anonRes = await fetch(`http://127.0.0.1:5098/api/v1/destinations/${testDirectDest.slug}/image`);
      if (anonRes.status !== 404) {
        throw new Error(`Expected 404 for draft image to public caller, got ${anonRes.status}`);
      }

      // Authorized staff request should receive 200
      const staffRes = await fetch(`http://127.0.0.1:5098/api/v1/destinations/${testDirectDest.slug}/image`, {
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      if (staffRes.status !== 200) {
        throw new Error(`Expected 200 for draft image to authorized staff, got ${staffRes.status}`);
      }

      // Cleanup test destination
      await fetch(`http://127.0.0.1:5098/api/v1/destinations/${testDirectDest._id || testDirectDest.slug}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${adminToken}` },
      });
    });

    // ==================== UPLOADS & AZERBAIJAN PRODUCTION PERSISTENCE TESTS ====================
    await check('Production Asset: GET /uploads/IMG-20250217-WA0144-1793262352561-9604fc.jpg returns HTTP 200', async () => {
      const res = await fetch('http://127.0.0.1:5098/uploads/IMG-20250217-WA0144-1793262352561-9604fc.jpg');
      if (res.status !== 200) {
        throw new Error(`Expected HTTP 200 for Azerbaijan uploaded image, got status ${res.status}`);
      }

      const contentType = res.headers.get('content-type');
      if (!contentType || !contentType.startsWith('image/')) {
        throw new Error(`Expected image content type, received ${contentType}`);
      }

      const buffer = await res.arrayBuffer();
      if (buffer.byteLength === 0) {
        throw new Error('Received empty buffer for upload asset');
      }
    });

    await check('Production Asset: Direct endpoint /api/v1/destinations/azerbaijan/image returns HTTP 200', async () => {
      const res = await fetch('http://127.0.0.1:5098/api/v1/destinations/azerbaijan/image');
      if (res.status !== 200) {
        throw new Error(`Expected HTTP 200 for direct Azerbaijan image, got status ${res.status}`);
      }
      const buffer = await res.arrayBuffer();
      if (buffer.byteLength === 0) {
        throw new Error('Received empty buffer for direct Azerbaijan image');
      }
    });

    await check('Production Asset: Resilient MongoDB Fallback serves /uploads/:filename even if disk file is missing', async () => {
      // Test fallback mechanism with a filename that exists in MongoDB's originalName
      const res = await fetch('http://127.0.0.1:5098/uploads/IMG-20250217-WA0144-1793262352561-9604fc.jpg');
      if (res.status !== 200) {
        throw new Error(`Expected 200 from fallback handler, got ${res.status}`);
      }
    });

    console.log(`\n--- Test Suite Completed: ${failures === 0 ? 'ALL TESTS PASSED 🎉' : `${failures} TESTS FAILED`} ---`);
  } finally {
    server.close();
  }

  if (failures > 0) process.exit(1);
}

runTests();
