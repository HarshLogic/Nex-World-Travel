import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { User } from '../models/User.js';
import { MemberProfile } from '../models/MemberProfile.js';
import { PaymentTransaction } from '../models/PaymentTransaction.js';
import { EmployeePermission, ALL_PERMISSIONS } from '../models/EmployeePermission.js';
import { EmployeeChangeRequest } from '../models/EmployeeChangeRequest.js';
import { MemberRequest } from '../models/MemberRequest.js';
import { Destination } from '../models/Destination.js';
import { Activity } from '../models/Activity.js';
import { Package } from '../models/Package.js';
import { Booking } from '../models/Booking.js';
import { Contact } from '../models/Contact.js';
import { TermsCondition } from '../models/TermsCondition.js';
import { AuditLog } from '../models/AuditLog.js';
import { seedDestinations, seedActivities, seedPackages } from '../data/seedData.js';

class ResilientStore {
  constructor() {
    this.users = [];
    this.members = [];
    this.payments = [];
    this.permissions = [];
    this.changeRequests = [];
    this.memberRequests = [];
    this.destinations = [...seedDestinations.map((d, i) => ({
      ...d,
      _id: `dest-${i + 1}`,
      category: i < 2 ? 'Dream Destinations' : 'Top Destinations',
      publicationStatus: 'published',
      isDeleted: false,
      displayOrder: i + 1,
    }))];
    this.activities = [...seedActivities];
    this.packages = [...seedPackages];
    this.bookings = [];
    this.contacts = [];
    this.terms = {
      version: 'v1.0-2026',
      title: 'Nexworld Travel & Tourism — Membership Terms & Conditions',
      content: `### 1. Membership Eligibility & Entitlement
Nex World Travel memberships are personal and non-transferable unless authorized in writing by the Master Head administrator. Members in good standing are entitled to redeem their allocated Available Nights during their active Tenure Period.

### 2. Available Nights Redemption
Available Nights may be redeemed across contracted partner properties and curated member hotels. Booking requests must be submitted at least 14 days in advance during regular season, and 30 days during peak holiday dates.

### 3. Travel Card Benefit
Members with the Travel Card Benefit (marked with an active green status badge) enjoy exclusive airport transfers, priority lounge access, and discounts on customized activities.

### 4. EMI and Payment Schedules
Monthly EMI installments must be settled on or before the agreed Next Due Date. Accounts with overdue installments exceeding 60 days are subject to temporary suspension until regularized.`,
      isActive: true,
      updatedBy: 'Master Head',
      updatedAt: new Date().toISOString(),
    };
    this.auditLogs = [];
    this.securityTokens = new Map();
    this.initialized = false;
  }

  isMongoLive() {
    return mongoose.connection.readyState === 1;
  }

  generateCode(prefix = 'NEX') {
    const year = new Date().getFullYear();
    const random = Math.floor(1000 + Math.random() * 9000);
    return `${prefix}-${year}-${random}`;
  }

  async initializeSeedAccounts() {
    if (this.initialized) return;

    const adminHash = await bcrypt.hash('AdminPassword2026!', 10);
    const staffHash = await bcrypt.hash('StaffPassword2026!', 10);
    const memberHash = await bcrypt.hash('MemberPassword2026!', 10);

    // Initial Master Head
    const masterHead = {
      _id: 'user-admin-1',
      id: 'user-admin-1',
      role: 'master_head',
      email: 'admin@nexworldtravel.com',
      name: 'Master Head Administrator',
      phone: '+971 2 639 5908',
      isActive: true,
      passwordHash: adminHash,
      createdAt: new Date().toISOString(),
    };

    // Initial Staff / Employee
    const staffUser = {
      _id: 'user-staff-1',
      id: 'user-staff-1',
      role: 'employee',
      email: 'staff@nexworldtravel.com',
      name: 'Sarah Al Zaabi (Travel Consultant)',
      phone: '+971 2 639 7786',
      isActive: true,
      passwordHash: staffHash,
      createdAt: new Date().toISOString(),
    };

    // Initial Member
    const memberUser = {
      _id: 'user-member-1',
      id: 'user-member-1',
      role: 'member',
      memberId: 'NEX-M-1001',
      email: 'member@nexworldtravel.com',
      name: 'Dr. Tariq Al Nuaimi',
      phone: '+971 50 123 4567',
      isActive: true,
      passwordHash: memberHash,
      createdAt: new Date().toISOString(),
    };

    // Add to in-memory store
    this.users = [masterHead, staffUser, memberUser];

    // Initial Member Profile
    const memberProfile = {
      _id: 'prof-member-1',
      id: 'prof-member-1',
      userId: 'user-member-1',
      memberId: 'NEX-M-1001',
      registeredName: 'Dr. Tariq Al Nuaimi',
      email: 'member@nexworldtravel.com',
      phone: '+971 50 123 4567',
      packageType: 'Gold',
      availableNights: 14,
      extraOffers: 'VIP Airport Meet & Assist + 10% curated dining privilege worldwide',
      tenurePeriod: '5 Years (2024 - 2029)',
      travelCardBenefit: true,
      purchaseDate: new Date('2024-03-15').toISOString(),
      productPrice: 24000,
      totalAmountPaid: 16000,
      outstandingBalance: 8000,
      hasEMI: true,
      emiAmount: 1000,
      emiTenureMonths: 24,
      emiPaidMonths: 16,
      nextEMIDueDate: new Date('2026-11-15').toISOString(),
      dueAmount: 1000,
      paymentStatus: 'Up to Date',
      membershipStatus: 'Active',
      termsAccepted: true,
      termsAcceptedAt: new Date('2024-03-15').toISOString(),
      termsVersion: 'v1.0-2026',
      createdAt: new Date('2024-03-15').toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.members = [memberProfile];

    // Seed Initial Payment
    this.payments = [
      {
        _id: 'pay-1',
        transactionId: 'TXN-2026-1001',
        memberId: 'NEX-M-1001',
        amount: 8000,
        paymentType: 'down_payment',
        paymentMethod: 'Bank Transfer',
        referenceNumber: 'ADCB-REF-89472',
        notes: 'Initial enrollment down payment',
        recordedBy: 'admin@nexworldtravel.com',
        date: new Date('2024-03-15').toISOString(),
      },
      {
        _id: 'pay-2',
        transactionId: 'TXN-2026-1002',
        memberId: 'NEX-M-1001',
        amount: 8000,
        paymentType: 'emi_installment',
        paymentMethod: 'Credit Card',
        referenceNumber: 'FAB-AUTH-9021',
        notes: 'EMI installments 1-8 consolidated payment',
        recordedBy: 'staff@nexworldtravel.com',
        date: new Date('2024-11-10').toISOString(),
      },
    ];

    // Seed Staff Permissions
    this.permissions = [
      {
        _id: 'perm-1',
        userId: 'user-staff-1',
        email: 'staff@nexworldtravel.com',
        permissions: [
          'view_members',
          'create_member',
          'create_member_change_request',
          'manage_bookings',
          'edit_destinations',
          'view_reports',
        ],
        assignedBy: 'admin@nexworldtravel.com',
      },
    ];

    // Seed a sample Member Support Request
    this.memberRequests = [
      {
        _id: 'req-1',
        requestReference: 'REQ-2026-1001',
        memberId: 'NEX-M-1001',
        memberName: 'Dr. Tariq Al Nuaimi',
        memberEmail: 'member@nexworldtravel.com',
        requestType: 'Booking Assistance',
        subject: 'Redeem 5 nights for Paris & Rome vacation in November',
        message: 'Hello team, I would like to utilize 5 nights from my Gold membership for a European vacation in mid-November for 2 adults.',
        status: 'Under Review',
        responseDeadline: new Date(Date.now() + 18 * 60 * 60 * 1000).toISOString(),
        internalNotes: [
          { note: 'Assigned to travel consultant Sarah to check boutique partner availability.', author: 'admin@nexworldtravel.com', createdAt: new Date().toISOString() },
        ],
        createdAt: new Date().toISOString(),
      },
    ];

    // Seed a sample Employee Change Request
    this.changeRequests = [
      {
        _id: 'cr-1',
        requestId: 'CR-2026-1001',
        employeeId: 'user-staff-1',
        employeeName: 'Sarah Al Zaabi',
        employeeEmail: 'staff@nexworldtravel.com',
        entityType: 'membership_plan',
        targetId: 'NEX-M-1001',
        targetName: 'Dr. Tariq Al Nuaimi',
        currentValue: { availableNights: 14 },
        proposedValue: { availableNights: 17 },
        reason: 'Customer completed loyalty tenure renewal promotion (adding 3 bonus nights).',
        status: 'Pending',
        reviewedBy: null,
        reviewedAt: null,
        reviewNotes: '',
        createdAt: new Date().toISOString(),
      },
    ];

    // Seed Booking Enquiry
    this.bookings = [
      {
        _id: 'bk-1',
        enquiryNumber: 'NEX-BK-2026-1001',
        customerName: 'Alexander Wright',
        prefix: 'Mr.',
        firstName: 'Alexander',
        lastName: 'Wright',
        email: 'alexander@example.com',
        phone: '+971 50 123 4567',
        streetAddress: 'Corniche St, Tower 4',
        stateProvince: 'Abu Dhabi',
        nationality: 'United Arab Emirates',
        destinationOrPackage: 'European Elegance & Grand Capitals',
        travelDate: '2026-11-20',
        adults: 2,
        children: 1,
        numberOfNights: 12,
        activitiesRequired: 'Private Seine dinner cruise and Colosseum guided tour',
        status: 'New',
        emailNotificationSent: true,
        consent: true,
        internalNotes: [],
        createdAt: new Date().toISOString(),
      },
    ];

    // If MongoDB is live, seed into Mongo
    if (this.isMongoLive()) {
      try {
        const count = await User.countDocuments();
        if (count === 0) {
          await User.create(masterHead);
          await User.create(staffUser);
          await User.create(memberUser);
          await MemberProfile.create({ ...memberProfile, userId: memberUser._id });
          await EmployeePermission.create(this.permissions[0]);
          await Destination.insertMany(this.destinations);
          await TermsCondition.create(this.terms);
          console.log('[StoreService] Successfully seeded MongoDB with initial accounts and destinations.');
        }
      } catch (err) {
        console.warn('[StoreService] Mongo seeding warning:', err.message);
      }
    }

    this.initialized = true;
  }

  // ==================== AUTH & USERS ====================
  async getUserByEmail(email) {
    await this.initializeSeedAccounts();
    const cleanEmail = email.toLowerCase().trim();
    if (this.isMongoLive()) {
      try {
        const user = await User.findOne({ email: cleanEmail });
        if (user) return user.toObject();
      } catch (e) {}
    }
    return this.users.find((u) => u.email && u.email.toLowerCase() === cleanEmail) || null;
  }

  async getUserByMemberId(memberId) {
    await this.initializeSeedAccounts();
    const cleanId = memberId.toUpperCase().trim();
    if (this.isMongoLive()) {
      try {
        const user = await User.findOne({ memberId: cleanId });
        if (user) return user.toObject();
      } catch (e) {}
    }
    return this.users.find((u) => u.memberId && u.memberId.toUpperCase() === cleanId) || null;
  }

  async getUserById(id) {
    await this.initializeSeedAccounts();
    if (this.isMongoLive()) {
      try {
        const user = await User.findById(id);
        if (user) return user.toObject();
      } catch (e) {}
    }
    return this.users.find((u) => (u._id && u._id.toString() === id.toString()) || u.id === id) || null;
  }

  async createUser(userData) {
    const passwordHash = await bcrypt.hash(userData.password || 'Temporary2026!', 10);
    const id = `user-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const record = {
      _id: id,
      id,
      role: userData.role,
      email: userData.email ? userData.email.toLowerCase().trim() : undefined,
      memberId: userData.memberId ? userData.memberId.toUpperCase().trim() : undefined,
      name: userData.name,
      phone: userData.phone || '',
      isActive: userData.isActive !== undefined ? userData.isActive : true,
      mustChangePassword: !!userData.mustChangePassword,
      passwordHash,
      createdAt: new Date().toISOString(),
    };

    if (this.isMongoLive()) {
      try {
        const doc = await User.create(record);
        return doc.toObject();
      } catch (e) {}
    }
    this.users.push(record);
    return record;
  }

  // ==================== SECURITY & ACTIVATION TOKENS ====================
  async createPasswordResetToken(email) {
    await this.initializeSeedAccounts();
    const cleanEmail = email.toLowerCase().trim();
    let user = null;

    if (this.isMongoLive()) {
      try {
        user = await User.findOne({ email: cleanEmail });
      } catch (e) {}
    }
    if (!user) {
      user = this.users.find((u) => u.email && u.email.toLowerCase() === cleanEmail);
    }

    if (!user || !user.isActive) return null;

    const token = crypto.randomBytes(24).toString('hex');
    this.securityTokens.set(token, {
      userId: user._id ? user._id.toString() : user.id,
      email: user.email,
      name: user.name,
      type: 'reset',
      expiresAt: Date.now() + 60 * 60 * 1000, // 1 hour
    });

    return { token, user };
  }

  createActivationToken(userId, email, name = '') {
    const token = crypto.randomBytes(24).toString('hex');
    this.securityTokens.set(token, {
      userId: userId ? userId.toString() : userId,
      email: email.toLowerCase().trim(),
      name,
      type: 'activation',
      expiresAt: Date.now() + 48 * 60 * 60 * 1000, // 48 hours
    });
    return token;
  }

  verifySecurityToken(token) {
    if (!token) return { valid: false, message: 'Security token is required.' };
    const entry = this.securityTokens.get(token);
    if (!entry) return { valid: false, message: 'Invalid or expired token.' };
    if (Date.now() > entry.expiresAt) {
      this.securityTokens.delete(token);
      return { valid: false, message: 'Token has expired. Please request a new link.' };
    }
    return { valid: true, ...entry };
  }

  async consumeTokenAndSetPassword(token, newPassword) {
    const check = this.verifySecurityToken(token);
    if (!check.valid) throw new Error(check.message);

    const user = await this.getUserById(check.userId);
    if (!user) throw new Error('Account associated with token no longer exists.');

    const passwordHash = await bcrypt.hash(newPassword, 10);
    user.passwordHash = passwordHash;
    user.isActive = true;
    user.isActivated = true;

    if (this.isMongoLive()) {
      try {
        await User.findByIdAndUpdate(check.userId, {
          passwordHash,
          isActive: true,
          isActivated: true,
        });
      } catch (e) {}
    }

    this.securityTokens.delete(token);
    await this.logAudit(
      check.type === 'activation' ? 'ACCOUNT_ACTIVATED' : 'PASSWORD_RESET',
      user.email,
      'user',
      user.email,
      { type: check.type }
    );

    return user;
  }

  // ==================== MEMBERS MANAGEMENT ====================
  async getMembers({ page = 1, limit = 20, search = '', status = '', packageType = '' } = {}) {
    await this.initializeSeedAccounts();
    page = Math.max(1, parseInt(page, 10));
    limit = Math.min(100, Math.max(1, parseInt(limit, 10)));

    if (this.isMongoLive()) {
      try {
        const filter = {};
        if (status) filter.membershipStatus = status;
        if (packageType) filter.packageType = packageType;
        if (search) {
          const regex = new RegExp(search, 'i');
          filter.$or = [
            { memberId: regex },
            { registeredName: regex },
            { email: regex },
            { phone: regex },
          ];
        }

        const total = await MemberProfile.countDocuments(filter);
        const members = await MemberProfile.find(filter)
          .sort({ createdAt: -1 })
          .skip((page - 1) * limit)
          .limit(limit)
          .lean();

        return {
          members,
          pagination: {
            total,
            page,
            limit,
            pages: Math.ceil(total / limit),
          },
        };
      } catch (e) {}
    }

    let results = [...this.members];
    if (status) results = results.filter((m) => m.membershipStatus.toLowerCase() === status.toLowerCase());
    if (packageType) results = results.filter((m) => m.packageType.toLowerCase() === packageType.toLowerCase());
    if (search) {
      const q = search.toLowerCase();
      results = results.filter(
        (m) =>
          m.memberId.toLowerCase().includes(q) ||
          m.registeredName.toLowerCase().includes(q) ||
          m.email.toLowerCase().includes(q) ||
          (m.phone && m.phone.toLowerCase().includes(q))
      );
    }

    const total = results.length;
    const paginated = results.slice((page - 1) * limit, page * limit);

    return {
      members: paginated,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit) || 1,
      },
    };
  }

  async getMemberById(memberId) {
    await this.initializeSeedAccounts();
    const cleanId = memberId.toUpperCase().trim();
    if (this.isMongoLive()) {
      try {
        const member = await MemberProfile.findOne({ memberId: cleanId }).lean();
        if (member) return member;
      } catch (e) {}
    }
    return this.members.find((m) => m.memberId.toUpperCase() === cleanId) || null;
  }

  async createMember(data, author = 'Master Head') {
    const existing = await this.getMemberById(data.memberId);
    if (existing) {
      throw new Error(`Member with ID '${data.memberId}' already exists.`);
    }

    // 1. Create auth user
    const user = await this.createUser({
      role: 'member',
      memberId: data.memberId,
      name: data.registeredName,
      email: data.email,
      phone: data.phone,
      password: data.initialPassword,
    });

    const productPrice = Number(data.productPrice || 0);
    const initialPaid = Number(data.initialPaidAmount || 0);
    const balance = Math.max(0, productPrice - initialPaid);

    const profile = {
      _id: `prof-${Date.now()}`,
      userId: user._id || user.id,
      memberId: data.memberId.toUpperCase().trim(),
      registeredName: data.registeredName.trim(),
      email: data.email.toLowerCase().trim(),
      phone: data.phone || '',
      packageType: data.packageType || 'Silver',
      availableNights: Number(data.availableNights || 7),
      extraOffers: data.extraOffers || 'VIP Airport Meet & Assist',
      tenurePeriod: data.tenurePeriod || '5 Years',
      travelCardBenefit: !!data.travelCardBenefit,
      purchaseDate: data.purchaseDate ? new Date(data.purchaseDate).toISOString() : new Date().toISOString(),
      productPrice,
      totalAmountPaid: 0,
      outstandingBalance: productPrice,
      hasEMI: !!data.hasEMI,
      emiAmount: Number(data.emiAmount || 0),
      emiTenureMonths: Number(data.emiTenureMonths || 0),
      emiPaidMonths: 0,
      nextEMIDueDate: data.nextEMIDueDate || null,
      dueAmount: Number(data.emiAmount || 0),
      paymentStatus: productPrice === 0 ? 'Fully Paid' : 'Up to Date',
      membershipStatus: data.membershipStatus || 'Active',
      termsAccepted: false,
      termsVersion: 'v1.0-2026',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    if (this.isMongoLive()) {
      try {
        const doc = await MemberProfile.create(profile);
        return doc.toObject();
      } catch (e) {}
    }

    this.members.unshift(profile);

    // Record initial down payment if > 0
    if (initialPaid > 0) {
      await this.recordPayment(profile.memberId, {
        amount: initialPaid,
        paymentType: 'down_payment',
        paymentMethod: 'Bank Transfer',
        notes: 'Initial enrollment payment',
      }, author);
    }

    await this.logAudit('MEMBER_CREATED', author, 'member', profile.memberId, { registeredName: profile.registeredName });
    return profile;
  }

  async updateMember(memberId, updateData, author = 'Master Head') {
    const member = await this.getMemberById(memberId);
    if (!member) throw new Error(`Member '${memberId}' not found.`);

    const oldValues = { ...member };

    if (updateData.productPrice !== undefined) {
      member.productPrice = Number(updateData.productPrice);
      member.outstandingBalance = Math.max(0, member.productPrice - member.totalAmountPaid);
    }

    Object.assign(member, updateData, { updatedAt: new Date().toISOString() });

    if (this.isMongoLive()) {
      try {
        await MemberProfile.findOneAndUpdate({ memberId: memberId.toUpperCase() }, member);
      } catch (e) {}
    } else {
      const idx = this.members.findIndex((m) => m.memberId.toUpperCase() === memberId.toUpperCase());
      if (idx !== -1) this.members[idx] = member;
    }

    await this.logAudit('MEMBER_UPDATED', author, 'member', memberId, {
      changedFields: Object.keys(updateData),
      reason: updateData.reason || 'Staff update',
    });

    return member;
  }

  async recordPayment(memberId, paymentData, author = 'Master Head') {
    const member = await this.getMemberById(memberId);
    if (!member) throw new Error(`Member '${memberId}' not found.`);

    const amount = Number(paymentData.amount);
    const transactionId = this.generateCode('TXN');

    const paymentRecord = {
      _id: `pay-${Date.now()}`,
      transactionId,
      memberId: member.memberId,
      amount,
      paymentType: paymentData.paymentType || 'emi_installment',
      paymentMethod: paymentData.paymentMethod || 'Bank Transfer',
      referenceNumber: paymentData.referenceNumber || '',
      notes: paymentData.notes || '',
      recordedBy: author,
      date: new Date().toISOString(),
    };

    if (this.isMongoLive()) {
      try {
        await PaymentTransaction.create(paymentRecord);
      } catch (e) {}
    }
    this.payments.unshift(paymentRecord);

    // Update member financial totals
    const newPaid = Number(member.totalAmountPaid) + amount;
    const newBalance = Math.max(0, Number(member.productPrice) - newPaid);
    let newStatus = member.paymentStatus;
    if (newBalance === 0) newStatus = 'Fully Paid';
    else newStatus = 'Up to Date';

    await this.updateMember(memberId, {
      totalAmountPaid: newPaid,
      outstandingBalance: newBalance,
      paymentStatus: newStatus,
      emiPaidMonths: member.emiAmount > 0 ? Math.floor(newPaid / member.emiAmount) : member.emiPaidMonths,
    }, author);

    await this.logAudit('PAYMENT_RECORDED', author, 'financial', memberId, {
      transactionId,
      amount,
      newBalance,
    });

    return paymentRecord;
  }

  async getMemberPayments(memberId) {
    await this.initializeSeedAccounts();
    const cleanId = memberId.toUpperCase().trim();
    if (this.isMongoLive()) {
      try {
        return await PaymentTransaction.find({ memberId: cleanId }).sort({ date: -1 }).lean();
      } catch (e) {}
    }
    return this.payments.filter((p) => p.memberId.toUpperCase() === cleanId);
  }

  // ==================== EMPLOYEES & PERMISSIONS ====================
  async getEmployees() {
    await this.initializeSeedAccounts();
    if (this.isMongoLive()) {
      try {
        return await User.find({ role: 'employee' }).lean();
      } catch (e) {}
    }
    return this.users.filter((u) => u.role === 'employee');
  }

  async createEmployee(employeeData, author = 'Master Head') {
    const existing = await this.getUserByEmail(employeeData.email);
    if (existing) throw new Error(`User with email '${employeeData.email}' already exists.`);

    const user = await this.createUser({
      role: 'employee',
      name: employeeData.name,
      email: employeeData.email,
      phone: employeeData.phone,
      password: employeeData.password || 'Staff2026!',
    });

    const permissions = employeeData.permissions || [
      'view_members',
      'create_member_change_request',
      'manage_bookings',
    ];

    const permRecord = {
      _id: `perm-${Date.now()}`,
      userId: user._id || user.id,
      email: user.email,
      permissions,
      assignedBy: author,
    };

    if (this.isMongoLive()) {
      try {
        await EmployeePermission.create(permRecord);
      } catch (e) {}
    }
    this.permissions.push(permRecord);

    const activationToken = this.createActivationToken(user._id || user.id, user.email, user.name);

    await this.logAudit('EMPLOYEE_CREATED', author, 'employee', user.email, { permissions });
    return { ...user, permissions, activationToken, activationUrl: `/activate?token=${activationToken}` };
  }

  async getEmployeePermissions(userId) {
    await this.initializeSeedAccounts();
    if (this.isMongoLive()) {
      try {
        const record = await EmployeePermission.findOne({ userId });
        if (record) return record.permissions;
      } catch (e) {}
    }
    const found = this.permissions.find(
      (p) => (p.userId && p.userId.toString() === userId.toString()) || p.email === userId
    );
    return found ? found.permissions : [];
  }

  async updateEmployeePermissions(userId, permissions, author = 'Master Head') {
    const validPermissions = permissions.filter((p) => ALL_PERMISSIONS.includes(p));
    if (this.isMongoLive()) {
      try {
        await EmployeePermission.findOneAndUpdate(
          { userId },
          { permissions: validPermissions, assignedBy: author },
          { upsert: true }
        );
      } catch (e) {}
    }

    const idx = this.permissions.findIndex(
      (p) => (p.userId && p.userId.toString() === userId.toString()) || p.email === userId
    );
    if (idx !== -1) {
      this.permissions[idx].permissions = validPermissions;
    } else {
      this.permissions.push({ userId, permissions: validPermissions, assignedBy: author });
    }

    await this.logAudit('PERMISSIONS_UPDATED', author, 'employee', userId, { permissions: validPermissions });
    return validPermissions;
  }

  // ==================== EMPLOYEE CHANGE REQUESTS ====================
  async createChangeRequest(data, employee) {
    const requestId = this.generateCode('CR');
    const record = {
      _id: `cr-${Date.now()}`,
      requestId,
      employeeId: employee.id,
      employeeName: employee.name,
      employeeEmail: employee.email,
      entityType: data.entityType,
      targetId: data.targetId,
      targetName: data.targetName || data.targetId,
      currentValue: data.currentValue,
      proposedValue: data.proposedValue,
      reason: data.reason,
      status: 'Pending',
      reviewedBy: null,
      reviewedAt: null,
      reviewNotes: '',
      createdAt: new Date().toISOString(),
    };

    if (this.isMongoLive()) {
      try {
        const doc = await EmployeeChangeRequest.create(record);
        return doc.toObject();
      } catch (e) {}
    }
    this.changeRequests.unshift(record);
    await this.logAudit('CHANGE_REQUEST_SUBMITTED', employee.email, 'change_request', requestId, { entityType: data.entityType });
    return record;
  }

  async getChangeRequests({ status = '', employeeId = '' } = {}) {
    await this.initializeSeedAccounts();
    if (this.isMongoLive()) {
      try {
        const filter = {};
        if (status) filter.status = status;
        if (employeeId) filter.employeeId = employeeId;
        return await EmployeeChangeRequest.find(filter).sort({ createdAt: -1 }).lean();
      } catch (e) {}
    }

    let results = [...this.changeRequests];
    if (status) results = results.filter((r) => r.status.toLowerCase() === status.toLowerCase());
    if (employeeId) results = results.filter((r) => r.employeeId.toString() === employeeId.toString());
    return results;
  }

  async approveChangeRequest(requestId, reviewer = 'Master Head') {
    const request = this.changeRequests.find((r) => r.requestId === requestId || r._id === requestId);
    if (!request) throw new Error(`Change request '${requestId}' not found.`);
    if (request.status !== 'Pending') throw new Error(`Request has already been ${request.status}.`);

    // Apply the proposed change
    if (request.entityType === 'member_details' || request.entityType === 'membership_plan' || request.entityType === 'financial') {
      await this.updateMember(request.targetId, request.proposedValue, `${reviewer} (via approved CR-${requestId})`);
    } else if (request.entityType === 'destination') {
      await this.updateDestination(request.targetId, request.proposedValue, reviewer);
    }

    request.status = 'Approved';
    request.reviewedBy = reviewer;
    request.reviewedAt = new Date().toISOString();
    request.reviewNotes = 'Approved and applied successfully.';

    if (this.isMongoLive()) {
      try {
        await EmployeeChangeRequest.findOneAndUpdate(
          { requestId },
          { status: 'Approved', reviewedBy: reviewer, reviewedAt: new Date(), reviewNotes: request.reviewNotes }
        );
      } catch (e) {}
    }

    await this.logAudit('CHANGE_REQUEST_APPROVED', reviewer, 'change_request', requestId, { targetId: request.targetId });
    return request;
  }

  async rejectChangeRequest(requestId, reviewer = 'Master Head', notes = '') {
    const request = this.changeRequests.find((r) => r.requestId === requestId || r._id === requestId);
    if (!request) throw new Error(`Change request '${requestId}' not found.`);
    if (request.status !== 'Pending') throw new Error(`Request has already been ${request.status}.`);

    request.status = 'Rejected';
    request.reviewedBy = reviewer;
    request.reviewedAt = new Date().toISOString();
    request.reviewNotes = notes || 'Rejected by Master Head.';

    if (this.isMongoLive()) {
      try {
        await EmployeeChangeRequest.findOneAndUpdate(
          { requestId },
          { status: 'Rejected', reviewedBy: reviewer, reviewedAt: new Date(), reviewNotes: request.reviewNotes }
        );
      } catch (e) {}
    }

    await this.logAudit('CHANGE_REQUEST_REJECTED', reviewer, 'change_request', requestId, { notes });
    return request;
  }

  // ==================== MEMBER SUPPORT REQUESTS ====================
  async createMemberRequest(data, member) {
    const requestReference = this.generateCode('REQ');
    const record = {
      _id: `req-${Date.now()}`,
      requestReference,
      memberId: member.memberId,
      memberName: member.name,
      memberEmail: member.email,
      requestType: data.requestType,
      subject: data.subject,
      message: data.message,
      status: 'Submitted',
      responseDeadline: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      internalNotes: [],
      createdAt: new Date().toISOString(),
    };

    if (this.isMongoLive()) {
      try {
        const doc = await MemberRequest.create(record);
        return doc.toObject();
      } catch (e) {}
    }
    this.memberRequests.unshift(record);
    await this.logAudit('MEMBER_REQUEST_SUBMITTED', member.memberId, 'member_request', requestReference, { type: data.requestType });
    return record;
  }

  async getMemberRequests({ memberId = '', status = '' } = {}) {
    await this.initializeSeedAccounts();
    if (this.isMongoLive()) {
      try {
        const filter = {};
        if (memberId) filter.memberId = memberId.toUpperCase();
        if (status) filter.status = status;
        return await MemberRequest.find(filter).sort({ createdAt: -1 }).lean();
      } catch (e) {}
    }

    let results = [...this.memberRequests];
    if (memberId) results = results.filter((r) => r.memberId.toUpperCase() === memberId.toUpperCase());
    if (status) results = results.filter((r) => r.status.toLowerCase() === status.toLowerCase());
    return results;
  }

  async updateMemberRequest(id, updateData, author = 'Staff') {
    const req = this.memberRequests.find((r) => r.requestReference === id || r._id === id);
    if (!req) throw new Error(`Member request '${id}' not found.`);

    if (updateData.status) req.status = updateData.status;
    if (updateData.status === 'Resolved') req.resolvedAt = new Date().toISOString();
    if (updateData.note) {
      req.internalNotes = req.internalNotes || [];
      req.internalNotes.push({ note: updateData.note, author, createdAt: new Date().toISOString() });
    }

    if (this.isMongoLive()) {
      try {
        await MemberRequest.findOneAndUpdate(
          { $or: [{ requestReference: id }, { _id: id }] },
          { $set: updateData }
        );
      } catch (e) {}
    }

    await this.logAudit('MEMBER_REQUEST_UPDATED', author, 'member_request', id, { status: req.status });
    return req;
  }

  // ==================== DESTINATIONS (DREAM & TOP) ====================
  async getDestinations(filter = {}) {
    await this.initializeSeedAccounts();
    if (this.isMongoLive()) {
      try {
        const q = { isDeleted: false };
        if (filter.category) q.category = filter.category;
        if (filter.region) q.region = filter.region;
        if (filter.featured !== undefined) q.featured = filter.featured;
        if (filter.publicationStatus) q.publicationStatus = filter.publicationStatus;
        return await Destination.find(q).sort({ displayOrder: 1, createdAt: -1 }).lean();
      } catch (e) {}
    }

    let results = this.destinations.filter((d) => !d.isDeleted);
    if (filter.category) results = results.filter((d) => d.category?.toLowerCase() === filter.category.toLowerCase());
    if (filter.region) results = results.filter((d) => d.region?.toLowerCase() === filter.region.toLowerCase());
    if (filter.featured !== undefined) results = results.filter((d) => d.featured === filter.featured);
    if (filter.publicationStatus) results = results.filter((d) => d.publicationStatus === filter.publicationStatus);
    return results.sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));
  }

  async getDestinationBySlug(slug) {
    await this.initializeSeedAccounts();
    const cleanSlug = slug.toLowerCase().trim();
    if (this.isMongoLive()) {
      try {
        const found = await Destination.findOne({ slug: cleanSlug, isDeleted: false }).lean();
        if (found) return found;
      } catch (e) {}
    }
    return this.destinations.find((d) => d.slug.toLowerCase() === cleanSlug && !d.isDeleted) || null;
  }

  async createDestination(data, author = 'Master Head') {
    const slug = data.slug || data.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const record = {
      ...data,
      _id: `dest-${Date.now()}`,
      slug,
      coverImage: data.coverImage || data.imageUrl || '/images/hero.jpg',
      imageUrl: data.imageUrl || data.coverImage || '/images/hero.jpg',
      category: data.category || 'Top Destinations',
      publicationStatus: data.publicationStatus || 'published',
      isDeleted: false,
      createdBy: author,
      updatedBy: author,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    if (this.isMongoLive()) {
      try {
        const doc = await Destination.create(record);
        return doc.toObject();
      } catch (e) {}
    }
    this.destinations.unshift(record);
    await this.logAudit('DESTINATION_CREATED', author, 'destination', slug, { title: data.title });
    return record;
  }

  async updateDestination(idOrSlug, updateData, author = 'Master Head') {
    const dest = this.destinations.find(
      (d) => d._id === idOrSlug || d.slug === idOrSlug || d.title.toLowerCase() === idOrSlug.toLowerCase()
    );
    if (!dest) throw new Error(`Destination '${idOrSlug}' not found.`);

    Object.assign(dest, updateData, { updatedBy: author, updatedAt: new Date().toISOString() });

    if (this.isMongoLive()) {
      try {
        await Destination.findOneAndUpdate({ $or: [{ _id: idOrSlug }, { slug: idOrSlug }] }, dest);
      } catch (e) {}
    }

    await this.logAudit('DESTINATION_UPDATED', author, 'destination', dest.slug, { updatedFields: Object.keys(updateData) });
    return dest;
  }

  async deleteDestination(idOrSlug, author = 'Master Head') {
    const dest = this.destinations.find((d) => d._id === idOrSlug || d.slug === idOrSlug);
    if (!dest) throw new Error(`Destination '${idOrSlug}' not found.`);

    dest.isDeleted = true;
    dest.publicationStatus = 'archived';
    dest.updatedBy = author;

    if (this.isMongoLive()) {
      try {
        await Destination.findOneAndUpdate(
          { $or: [{ _id: idOrSlug }, { slug: idOrSlug }] },
          { isDeleted: true, publicationStatus: 'archived', updatedBy: author }
        );
      } catch (e) {}
    }

    await this.logAudit('DESTINATION_DELETED', author, 'destination', dest.slug);
    return { success: true, message: `Destination '${dest.title}' soft-deleted successfully.` };
  }

  // ==================== BOOKING ENQUIRIES ====================
  async createBooking(bookingData) {
    const enquiryNumber = this.generateCode('NEX-BK');
    const customerName = `${bookingData.prefix || ''} ${bookingData.firstName || ''} ${bookingData.lastName || ''}`.trim();
    const record = {
      ...bookingData,
      _id: `bk-${Date.now()}`,
      enquiryNumber,
      customerName,
      status: 'New',
      emailNotificationSent: false,
      internalNotes: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    if (this.isMongoLive()) {
      try {
        const doc = await Booking.create(record);
        return doc.toObject();
      } catch (e) {}
    }

    this.bookings.unshift(record);
    return record;
  }

  async getBookings({ status = '', search = '' } = {}) {
    await this.initializeSeedAccounts();
    if (this.isMongoLive()) {
      try {
        const filter = {};
        if (status) filter.status = status;
        if (search) {
          const regex = new RegExp(search, 'i');
          filter.$or = [
            { enquiryNumber: regex },
            { customerName: regex },
            { email: regex },
            { destinationOrPackage: regex },
          ];
        }
        return await Booking.find(filter).sort({ createdAt: -1 }).lean();
      } catch (e) {}
    }

    let results = [...this.bookings];
    if (status) results = results.filter((b) => b.status.toLowerCase() === status.toLowerCase());
    if (search) {
      const q = search.toLowerCase();
      results = results.filter(
        (b) =>
          b.enquiryNumber.toLowerCase().includes(q) ||
          b.customerName.toLowerCase().includes(q) ||
          b.email.toLowerCase().includes(q) ||
          b.destinationOrPackage.toLowerCase().includes(q)
      );
    }
    return results;
  }

  async updateBooking(enquiryNumber, updateData, author = 'Staff') {
    const booking = this.bookings.find((b) => b.enquiryNumber === enquiryNumber || b._id === enquiryNumber);
    if (!booking) throw new Error(`Booking enquiry '${enquiryNumber}' not found.`);

    if (updateData.status) booking.status = updateData.status;
    if (updateData.emailNotificationSent !== undefined) booking.emailNotificationSent = updateData.emailNotificationSent;
    if (updateData.note) {
      booking.internalNotes = booking.internalNotes || [];
      booking.internalNotes.push({ note: updateData.note, author, createdAt: new Date().toISOString() });
    }

    if (this.isMongoLive()) {
      try {
        await Booking.findOneAndUpdate(
          { $or: [{ enquiryNumber }, { _id: enquiryNumber }] },
          { $set: booking }
        );
      } catch (e) {}
    }

    await this.logAudit('BOOKING_UPDATED', author, 'booking', enquiryNumber, { status: booking.status });
    return booking;
  }

  // ==================== TERMS & CONDITIONS ====================
  async getTerms() {
    await this.initializeSeedAccounts();
    if (this.isMongoLive()) {
      try {
        const doc = await TermsCondition.findOne({ isActive: true }).sort({ createdAt: -1 }).lean();
        if (doc) return doc;
      } catch (e) {}
    }
    return this.terms;
  }

  async updateTerms(content, author = 'Master Head') {
    const version = `v1.${Date.now().toString().slice(-4)}`;
    this.terms = {
      ...this.terms,
      version,
      content,
      updatedBy: author,
      updatedAt: new Date().toISOString(),
    };

    if (this.isMongoLive()) {
      try {
        await TermsCondition.create(this.terms);
      } catch (e) {}
    }

    await this.logAudit('TERMS_UPDATED', author, 'terms', version);
    return this.terms;
  }

  // ==================== METRICS & AUDIT ====================
  async getDashboardMetrics() {
    await this.initializeSeedAccounts();
    const members = await this.getMembers({ limit: 5000 });
    const allMembers = members.members;

    const totalMembers = allMembers.length;
    const activeMembers = allMembers.filter((m) => m.membershipStatus === 'Active').length;
    const goldMembers = allMembers.filter((m) => m.packageType === 'Gold').length;
    const silverMembers = allMembers.filter((m) => m.packageType === 'Silver').length;
    const totalOutstandingBalance = allMembers.reduce((sum, m) => sum + (Number(m.outstandingBalance) || 0), 0);
    const totalCollected = allMembers.reduce((sum, m) => sum + (Number(m.totalAmountPaid) || 0), 0);

    const pendingRequests = (await this.getMemberRequests({ status: 'Submitted' })).length +
      (await this.getMemberRequests({ status: 'Under Review' })).length;

    const pendingChangeRequests = (await this.getChangeRequests({ status: 'Pending' })).length;
    const newBookings = (await this.getBookings({ status: 'New' })).length;

    return {
      totalMembers,
      activeMembers,
      goldMembers,
      silverMembers,
      totalOutstandingBalance,
      totalCollected,
      pendingRequests,
      pendingChangeRequests,
      newBookings,
    };
  }

  async logAudit(action, performedBy, targetEntity, targetId = '', details = {}) {
    const record = {
      _id: `aud-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      action,
      performedBy,
      role: performedBy.includes('admin') ? 'master_head' : 'staff',
      targetEntity,
      targetId,
      details,
      timestamp: new Date().toISOString(),
    };

    if (this.isMongoLive()) {
      try {
        await AuditLog.create(record);
      } catch (e) {}
    }
    this.auditLogs.unshift(record);
  }

  async getAuditLogs(limit = 50) {
    if (this.isMongoLive()) {
      try {
        return await AuditLog.find().sort({ createdAt: -1 }).limit(limit).lean();
      } catch (e) {}
    }
    return this.auditLogs.slice(0, limit);
  }
}

export const store = new ResilientStore();
