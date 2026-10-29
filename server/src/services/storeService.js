import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import { parseAndValidateImage, detectImageSignature } from '../utils/imageValidator.js';
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
import { PlanAvailability } from '../models/PlanAvailability.js';
import { seedDestinations, seedActivities, seedPackages } from '../data/seedData.js';

class ResilientStore {
  constructor() {
    this.users = [];
    this.members = [];
    this.payments = [];
    this.permissions = [];
    this.changeRequests = [];
    this.memberRequests = [];
    this.availabilities = [];
    this.destinations = [...seedDestinations.map((d, i) => ({
      ...d,
      _id: d._id || `dest-${i + 1}`,
      category: d.category || (i < 2 ? 'Dream Destinations' : 'Top Destinations'),
      publicationStatus: d.publicationStatus || 'published',
      isDeleted: d.isDeleted || false,
      displayOrder: d.displayOrder || (i + 1),
    }))];
    this.activities = [...seedActivities.map((a, i) => ({
      ...a,
      _id: `act-${i + 1}`,
      shortDescription: a.description ? (a.description.length > 140 ? `${a.description.slice(0, 137)}...` : a.description) : '',
      coverImage: a.imageUrl,
      displayOrder: i + 1,
      publicationStatus: 'published',
      isDeleted: false,
      createdBy: 'Master Head',
      updatedBy: 'Master Head',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }))];
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

    const masterEmail = (process.env.MASTER_HEAD_EMAIL || 'adityar@nexworldtravel.com').toLowerCase();
    const masterPassword = process.env.MASTER_HEAD_PASSWORD || 'Aditiya@1993';
    const masterName = process.env.MASTER_HEAD_NAME || 'Aditya R';
    const adminHash = await bcrypt.hash(masterPassword, 10);
    const legacyAdminHash = await bcrypt.hash('AdminPassword2026!', 10);
    const staffHash = await bcrypt.hash('StaffPassword2026!', 10);
    const memberHash = await bcrypt.hash('MemberPassword2026!', 10);

    // Initial Master Head
    const masterHead = {
      _id: 'user-admin-1',
      id: 'user-admin-1',
      role: 'master_head',
      email: masterEmail,
      name: masterName,
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
    if (masterEmail !== 'admin@nexworldtravel.com') {
      this.users.push({
        _id: 'user-admin-legacy',
        id: 'user-admin-legacy',
        role: 'master_head',
        email: 'admin@nexworldtravel.com',
        name: 'Master Head Administrator (Legacy)',
        phone: '+971 2 639 5908',
        isActive: true,
        passwordHash: legacyAdminHash,
        createdAt: new Date().toISOString(),
      });
    }

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

    // Seed Available Trips and Plan Dates Calendar
    this.availabilities = [
      {
        _id: 'avail-1',
        id: 'avail-1',
        title: 'European Elegance: Paris & Rome Grand Tour',
        destinationOrPlan: 'Paris & Rome, Europe',
        packageTier: 'All',
        startDate: '2026-11-05',
        endDate: '2026-11-12',
        isAvailable: true,
        availableSeats: 8,
        bookedSeats: 2,
        notes: 'Includes VIP Louvre access, 5-star boutique accommodation, and high-speed rail transfer.',
        createdBy: 'Master Administrator',
        createdAt: new Date().toISOString(),
      },
      {
        _id: 'avail-2',
        id: 'avail-2',
        title: 'Swiss Alps & Glacier Express Scenic Panorama',
        destinationOrPlan: 'Zermatt & Zurich, Switzerland',
        packageTier: 'Gold',
        startDate: '2026-11-18',
        endDate: '2026-11-25',
        isAvailable: true,
        availableSeats: 6,
        bookedSeats: 4,
        notes: 'First-class Glacier Express journey with panoramic Alpine dining and private ski lodge access.',
        createdBy: 'Master Administrator',
        createdAt: new Date().toISOString(),
      },
      {
        _id: 'avail-3',
        id: 'avail-3',
        title: 'Bali Luxury Sanctuary & Ubud Rainforest Escape',
        destinationOrPlan: 'Bali, Indonesia',
        packageTier: 'Platinum',
        startDate: '2026-12-02',
        endDate: '2026-12-09',
        isAvailable: true,
        availableSeats: 10,
        bookedSeats: 1,
        notes: 'Private infinity pool villa, sunrise Mount Batur helicopter charter, and Ayurvedic wellness rituals.',
        createdBy: 'Master Administrator',
        createdAt: new Date().toISOString(),
      },
      {
        _id: 'avail-4',
        id: 'avail-4',
        title: 'Emirates Royal Oasis & Arabian Dune Retreat',
        destinationOrPlan: 'Abu Dhabi & Liwa Desert, UAE',
        packageTier: 'All',
        startDate: '2026-12-14',
        endDate: '2026-12-21',
        isAvailable: true,
        availableSeats: 12,
        bookedSeats: 0,
        notes: 'Exclusive Qasr Al Sarab desert tent experience, sunset falconry show, and private Yas Marina cruise.',
        createdBy: 'Master Administrator',
        createdAt: new Date().toISOString(),
      },
      {
        _id: 'avail-5',
        id: 'avail-5',
        title: 'Winter Festivities: Vienna & Prague Historic Castles',
        destinationOrPlan: 'Vienna & Prague, Central Europe',
        packageTier: 'Gold Plus',
        startDate: '2026-12-24',
        endDate: '2026-12-31',
        isAvailable: false,
        availableSeats: 0,
        bookedSeats: 10,
        notes: 'Sold out holiday season departure.',
        createdBy: 'Master Administrator',
        createdAt: new Date().toISOString(),
      },
      {
        _id: 'avail-6',
        id: 'avail-6',
        title: 'Tokyo & Kyoto Cultural Heritage Expedition',
        destinationOrPlan: 'Tokyo & Kyoto, Japan',
        packageTier: 'Titanium',
        startDate: '2027-01-10',
        endDate: '2027-01-18',
        isAvailable: true,
        availableSeats: 6,
        bookedSeats: 2,
        notes: 'Shinkansen Gran Class transit, private geisha tea banquet in Gion, and luxury ryokan hot spring stays.',
        createdBy: 'Master Administrator',
        createdAt: new Date().toISOString(),
      },
      {
        _id: 'avail-7',
        id: 'avail-7',
        title: 'Amalfi Coast & Capri Private Yacht Sojourn',
        destinationOrPlan: 'Amalfi Coast & Capri, Italy',
        packageTier: 'Platinum+',
        startDate: '2027-02-08',
        endDate: '2027-02-15',
        isAvailable: true,
        availableSeats: 8,
        bookedSeats: 0,
        notes: 'Cliffside luxury hotel suites in Positano and private day charter along the Faraglioni cliffs.',
        createdBy: 'Master Administrator',
        createdAt: new Date().toISOString(),
      },
      {
        _id: 'avail-8',
        id: 'avail-8',
        title: 'Kenya Maasai Mara Great Migration & Balloon Safari',
        destinationOrPlan: 'Maasai Mara, Kenya',
        packageTier: 'Gold',
        startDate: '2027-03-10',
        endDate: '2027-03-18',
        isAvailable: true,
        availableSeats: 10,
        bookedSeats: 3,
        notes: '4x4 custom Land Cruiser game drives with master naturalist guides and luxury tented bush lodge.',
        createdBy: 'Master Administrator',
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
          await Activity.insertMany(this.activities);
          await TermsCondition.create(this.terms);
          console.log('[StoreService] Successfully seeded MongoDB with initial accounts, destinations and activities.');
        } else {
          // If already seeded, make sure activities exist in MongoDB
          const actCount = await Activity.countDocuments();
          if (actCount === 0) {
            await Activity.insertMany(this.activities);
          }

          // Ensure destinations exist in MongoDB and standard seed destinations are never missing
          const destCount = await Destination.countDocuments({ isDeleted: { $ne: true } });
          if (destCount === 0) {
            await Destination.insertMany(this.destinations);
            console.log('[StoreService] Successfully seeded MongoDB with initial destinations.');
          } else {
            // Ensure every base destination is present in Mongo without overwriting any existing modifications
            for (const seed of this.destinations) {
              const exists = await Destination.findOne({ slug: seed.slug });
              if (!exists) {
                await Destination.create(seed);
              }
            }
          }

          // Ensure Europe and Africa image swap is persisted in live Mongo
          await Destination.updateOne(
            { slug: 'europe' },
            { $set: { imageUrl: '/images/destinations/africa.jpg', coverImage: '/images/destinations/africa.jpg' } }
          );
          await Destination.updateOne(
            { slug: 'africa' },
            { $set: { imageUrl: '/images/destinations/europe.jpg', coverImage: '/images/destinations/europe.jpg' } }
          );
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
        const obj = doc.toObject();
        this.users.push(obj);
        return obj;
      } catch (e) {
        console.error('[StoreService] Mongo User.create error:', e.message);
      }
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
        if (status) {
          const s = status.toLowerCase();
          if (s === 'open' || s === 'active') {
            filter.membershipStatus = { $in: ['Open', 'Active', 'open', 'active'] };
          } else if (s === 'close' || s === 'closed') {
            filter.membershipStatus = { $in: ['Close', 'closed', 'close'] };
          } else if (s === 'deactive' || s === 'deactivated' || s === 'suspended') {
            filter.membershipStatus = { $in: ['Deactive', 'deactive', 'Suspended', 'suspended'] };
          } else if (s === 'cancel' || s === 'cancelled' || s === 'expired') {
            filter.membershipStatus = { $in: ['Cancel', 'cancel', 'Cancelled', 'cancelled', 'Expired', 'expired'] };
          } else {
            filter.membershipStatus = new RegExp('^' + status + '$', 'i');
          }
        }
        if (packageType) {
          filter.packageType = new RegExp('^' + packageType.replace('+', '\\+') + '$', 'i');
        }
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
        const docs = await MemberProfile.find(filter)
          .sort({ createdAt: -1 })
          .skip((page - 1) * limit)
          .limit(limit)
          .lean();

        // Normalize fields for frontend consumer
        const members = docs.map((m) => ({
          ...m,
          status: m.membershipStatus || 'Open',
          membershipStatus: m.membershipStatus || 'Open',
          nightsAvailable: m.availableNights !== undefined ? m.availableNights : (m.nightsAvailable || 0),
          availableNights: m.availableNights !== undefined ? m.availableNights : (m.nightsAvailable || 0),
        }));

        return {
          members,
          pagination: {
            total,
            page,
            limit,
            pages: Math.ceil(total / limit) || 1,
          },
        };
      } catch (e) {
        console.error('[StoreService] Mongo getMembers error:', e.message);
      }
    }

    let results = [...this.members];
    if (status) {
      const s = status.toLowerCase();
      results = results.filter((m) => {
        const ms = (m.membershipStatus || m.status || 'Open').toLowerCase();
        if (s === 'open' || s === 'active') return ms === 'open' || ms === 'active';
        if (s === 'close' || s === 'closed') return ms === 'close' || ms === 'closed';
        if (s === 'deactive' || s === 'deactivated' || s === 'suspended') return ms === 'deactive' || ms === 'deactivated' || ms === 'suspended';
        if (s === 'cancel' || s === 'cancelled' || s === 'expired') return ms === 'cancel' || ms === 'cancelled' || ms === 'expired';
        return ms === s;
      });
    }
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
    const paginated = results.slice((page - 1) * limit, page * limit).map((m) => ({
      ...m,
      status: m.membershipStatus || 'Open',
      membershipStatus: m.membershipStatus || 'Open',
      nightsAvailable: m.availableNights !== undefined ? m.availableNights : (m.nightsAvailable || 0),
      availableNights: m.availableNights !== undefined ? m.availableNights : (m.nightsAvailable || 0),
    }));

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
      membershipStatus: data.membershipStatus || 'Open',
      termsAccepted: false,
      termsVersion: 'v1.0-2026',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    let finalProfile = profile;
    if (this.isMongoLive()) {
      try {
        const doc = await MemberProfile.create(profile);
        finalProfile = doc.toObject ? doc.toObject() : doc;
      } catch (e) {
        console.error('[StoreService] Mongo MemberProfile.create error:', e.message);
      }
    }

    this.members.unshift(finalProfile);

    // Record initial down payment if > 0
    if (initialPaid > 0) {
      await this.recordPayment(finalProfile.memberId, {
        amount: initialPaid,
        paymentType: 'down_payment',
        paymentMethod: 'Bank Transfer',
        notes: 'Initial enrollment payment',
      }, author);
      const updated = await this.getMemberById(finalProfile.memberId);
      if (updated) finalProfile = updated;
    }

    await this.logAudit('MEMBER_CREATED', author, 'member', finalProfile.memberId, { registeredName: finalProfile.registeredName });
    return finalProfile;
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
        await MemberProfile.findOneAndUpdate({ memberId: memberId.toUpperCase() }, { $set: updateData }, { new: true });
      } catch (e) {
        console.error('[StoreService] Mongo MemberProfile.findOneAndUpdate error:', e.message);
      }
    }
    const idx = this.members.findIndex((m) => m.memberId.toUpperCase() === memberId.toUpperCase());
    if (idx !== -1) this.members[idx] = member;

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
      } catch (e) {
        console.error('[StoreService] Mongo PaymentTransaction.create error:', e.message);
      }
    }
    this.payments.unshift(paymentRecord);

    // Update member financial totals
    const newPaid = Number(member.totalAmountPaid) + amount;
    const newBalance = Math.max(0, Number(member.productPrice) - newPaid);
    let newStatus = member.paymentStatus;
    if (newBalance === 0) newStatus = 'Fully Paid';
    else newStatus = 'Up to Date';

    const updatePayload = {
      totalAmountPaid: newPaid,
      outstandingBalance: newBalance,
      paymentStatus: newStatus,
      emiPaidMonths: member.emiAmount > 0 ? Math.floor(newPaid / member.emiAmount) : member.emiPaidMonths,
    };
    if (paymentData.membershipStatus) {
      updatePayload.membershipStatus = paymentData.membershipStatus;
    }

    await this.updateMember(memberId, updatePayload, author);

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
        const destCount = await Destination.countDocuments({ isDeleted: { $ne: true } });
        if (destCount === 0) {
          await Destination.insertMany(this.destinations);
        } else {
          for (const seed of this.destinations) {
            const exists = await Destination.findOne({ slug: seed.slug });
            if (!exists) await Destination.create(seed);
          }
        }

        const q = { isDeleted: { $ne: true } };
        if (filter.category) q.category = filter.category;
        if (filter.region) q.region = filter.region;
        if (filter.featured !== undefined) q.featured = filter.featured;
        if (filter.publicationStatus) q.publicationStatus = filter.publicationStatus;
        const mongoResults = await Destination.find(q).sort({ displayOrder: 1, createdAt: -1 }).lean();
        if (mongoResults && mongoResults.length > 0) {
          return mongoResults;
        }
      } catch (e) {
        console.warn('[StoreService] Mongo getDestinations error:', e.message);
      }
    }

    let results = this.destinations.filter((d) => !d.isDeleted);
    if (filter.category) results = results.filter((d) => d.category?.toLowerCase() === filter.category.toLowerCase());
    if (filter.region) results = results.filter((d) => d.region?.toLowerCase() === filter.region.toLowerCase());
    if (filter.featured !== undefined) results = results.filter((d) => d.featured === filter.featured);
    if (filter.publicationStatus) results = results.filter((d) => d.publicationStatus === filter.publicationStatus);

    // Ensure binary buffer is excluded from standard list responses
    const sanitized = results.map((d) => {
      if (d.image && d.image.data) {
        const copy = { ...d, image: { ...d.image } };
        delete copy.image.data;
        return copy;
      }
      return d;
    });
    return sanitized.sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));
  }

  async getDestinationBySlug(slug) {
    await this.initializeSeedAccounts();
    const cleanSlug = String(slug || '').toLowerCase().trim();
    if (this.isMongoLive()) {
      try {
        const found = await Destination.findOne({ slug: cleanSlug, isDeleted: { $ne: true } }).lean();
        if (found) {
          if (found.image && found.image.data) {
            delete found.image.data;
          }
          return found;
        }
      } catch (e) {}
    }
    const memFound = this.destinations.find((d) => d.slug.toLowerCase() === cleanSlug && !d.isDeleted);
    if (memFound) {
      if (memFound.image && memFound.image.data) {
        const copy = { ...memFound, image: { ...memFound.image } };
        delete copy.image.data;
        return copy;
      }
      return memFound;
    }
    return null;
  }

  async createDestination(data, author = 'Master Head') {
    await this.initializeSeedAccounts();
    const baseSlug = (data.slug || data.title || `dest-${Date.now()}`)
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');

    // Ensure unique slug so it never collides with an existing destination
    let uniqueSlug = baseSlug;
    let counter = 1;
    if (this.isMongoLive()) {
      while (await Destination.findOne({ slug: uniqueSlug })) {
        uniqueSlug = `${baseSlug}-${counter}`;
        counter++;
      }
    } else {
      while (this.destinations.some((d) => d.slug === uniqueSlug)) {
        uniqueSlug = `${baseSlug}-${counter}`;
        counter++;
      }
    }

    // Process and validate direct binary image if provided
    let imageRecord = null;
    let hasDirectImage = false;
    const rawImage =
      data.imageData ||
      data.imageBuffer ||
      (data.image &&
        (typeof data.image === 'string' ||
          Buffer.isBuffer(data.image) ||
          data.image.data));

    if (rawImage) {
      const input = (rawImage && rawImage.data) ? rawImage.data : rawImage;
      const origName =
        data.imageOriginalName ||
        data.originalName ||
        (data.image && data.image.originalName) ||
        `${uniqueSlug}.jpg`;
      const parsed = parseAndValidateImage(input, origName);
      if (parsed) {
        imageRecord = {
          data: parsed.buffer,
          contentType: parsed.mimeType,
          originalName: parsed.originalName,
          size: parsed.size,
        };
        hasDirectImage = true;
      }
    }

    const cleanData = { ...data };
    delete cleanData.imageData;
    delete cleanData.imageBuffer;
    delete cleanData.imageOriginalName;

    const record = {
      ...cleanData,
      _id: cleanData._id || `dest-${Date.now()}`,
      slug: uniqueSlug,
      coverImage: hasDirectImage
        ? `/api/v1/destinations/${uniqueSlug}/image`
        : cleanData.coverImage || cleanData.imageUrl || '/images/hero.jpg',
      imageUrl: hasDirectImage
        ? `/api/v1/destinations/${uniqueSlug}/image`
        : cleanData.imageUrl || cleanData.coverImage || '/images/hero.jpg',
      category: cleanData.category || 'Top Destinations',
      publicationStatus: cleanData.publicationStatus || 'published',
      hasDirectImage,
      isDeleted: false,
      createdBy: author,
      updatedBy: author,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    if (imageRecord) {
      record.image = imageRecord;
    }

    if (this.isMongoLive()) {
      try {
        // Ensure standard seed destinations exist in Mongo before adding new one
        const destCount = await Destination.countDocuments({ isDeleted: { $ne: true } });
        if (destCount === 0) {
          await Destination.insertMany(this.destinations);
        } else {
          for (const seed of this.destinations) {
            const exists = await Destination.findOne({ slug: seed.slug });
            if (!exists) await Destination.create(seed);
          }
        }

        const doc = await Destination.create(record);
        const obj = doc.toObject();
        if (obj.image) {
          delete obj.image.data;
        }
        this.destinations.unshift(record);
        await this.logAudit('DESTINATION_CREATED', author, 'destination', uniqueSlug, { title: data.title });
        return obj;
      } catch (e) {
        console.error('[StoreService] Error creating destination in Mongo:', e.message);
      }
    }

    this.destinations.unshift(record);
    await this.logAudit('DESTINATION_CREATED', author, 'destination', uniqueSlug, { title: data.title });
    const returnRecord = { ...record };
    if (returnRecord.image) {
      returnRecord.image = { ...returnRecord.image };
      delete returnRecord.image.data;
    }
    return returnRecord;
  }

  async updateDestination(idOrSlug, updateData, author = 'Master Head') {
    await this.initializeSeedAccounts();
    const cleanUpdate = { ...updateData };

    // Process optional direct binary image
    let newImageRecord = null;
    let hasNewDirectImage = false;
    const rawImage =
      updateData.imageData ||
      updateData.imageBuffer ||
      (updateData.image &&
        (typeof updateData.image === 'string' ||
          Buffer.isBuffer(updateData.image) ||
          updateData.image.data));

    if (rawImage) {
      const input = (rawImage && rawImage.data) ? rawImage.data : rawImage;
      const origName =
        updateData.imageOriginalName ||
        updateData.originalName ||
        (updateData.image && updateData.image.originalName) ||
        'destination.jpg';
      const parsed = parseAndValidateImage(input, origName);
      if (parsed) {
        newImageRecord = {
          data: parsed.buffer,
          contentType: parsed.mimeType,
          originalName: parsed.originalName,
          size: parsed.size,
        };
        hasNewDirectImage = true;
      }
    }

    delete cleanUpdate.imageData;
    delete cleanUpdate.imageBuffer;
    delete cleanUpdate.imageOriginalName;

    if (this.isMongoLive()) {
      try {
        const destDoc = await Destination.findOne({
          $or: [{ _id: idOrSlug }, { slug: idOrSlug }, { slug: String(idOrSlug).toLowerCase() }],
        }).select('+image.data');

        if (destDoc) {
          if (hasNewDirectImage) {
            cleanUpdate.image = newImageRecord;
            cleanUpdate.hasDirectImage = true;
            cleanUpdate.imageUrl = `/api/v1/destinations/${destDoc.slug}/image`;
            cleanUpdate.coverImage = `/api/v1/destinations/${destDoc.slug}/image`;
          } else if (!cleanUpdate.image) {
            // Preserve existing image when editing without replacement
            delete cleanUpdate.image;
          }

          Object.assign(destDoc, cleanUpdate, { updatedBy: author, updatedAt: new Date().toISOString() });
          await destDoc.save();

          const obj = destDoc.toObject();
          if (obj.image) {
            delete obj.image.data;
          }
          const idx = this.destinations.findIndex((d) => d._id === idOrSlug || d.slug === idOrSlug);
          if (idx !== -1) {
            this.destinations[idx] = { ...this.destinations[idx], ...cleanUpdate };
            if (hasNewDirectImage) this.destinations[idx].image = newImageRecord;
          } else {
            this.destinations.unshift(destDoc.toObject());
          }

          await this.logAudit('DESTINATION_UPDATED', author, 'destination', obj.slug, { updatedFields: Object.keys(cleanUpdate) });
          return obj;
        }
      } catch (e) {
        console.warn('[StoreService] Mongo updateDestination error:', e.message);
      }
    }

    const dest = this.destinations.find(
      (d) => d._id === idOrSlug || d.slug === idOrSlug || d.title?.toLowerCase() === String(idOrSlug).toLowerCase()
    );
    if (!dest) throw new Error(`Destination '${idOrSlug}' not found.`);

    if (hasNewDirectImage) {
      cleanUpdate.image = newImageRecord;
      cleanUpdate.hasDirectImage = true;
      cleanUpdate.imageUrl = `/api/v1/destinations/${dest.slug}/image`;
      cleanUpdate.coverImage = `/api/v1/destinations/${dest.slug}/image`;
    } else if (!cleanUpdate.image) {
      delete cleanUpdate.image;
    }

    Object.assign(dest, cleanUpdate, { updatedBy: author, updatedAt: new Date().toISOString() });
    await this.logAudit('DESTINATION_UPDATED', author, 'destination', dest.slug, { updatedFields: Object.keys(cleanUpdate) });

    const returnDest = { ...dest };
    if (returnDest.image) {
      returnDest.image = { ...returnDest.image };
      delete returnDest.image.data;
    }
    return returnDest;
  }

  async getDestinationImage(idOrSlug) {
    await this.initializeSeedAccounts();
    const cleanIdOrSlug = String(idOrSlug || '').trim();
    const lowerSlug = cleanIdOrSlug.toLowerCase();

    // 1. Try MongoDB
    if (this.isMongoLive()) {
      try {
        const dest = await Destination.findOne({
          $or: [{ _id: cleanIdOrSlug }, { slug: cleanIdOrSlug }, { slug: lowerSlug }],
          isDeleted: { $ne: true },
        }).select('+image.data');

        if (dest) {
          if (dest.image && dest.image.data) {
            return {
              buffer: dest.image.data,
              contentType: dest.image.contentType || 'image/jpeg',
              originalName: dest.image.originalName || `${dest.slug}.jpg`,
              size: dest.image.size || dest.image.data.length,
              publicationStatus: dest.publicationStatus,
              updatedAt: dest.updatedAt || dest.createdAt || new Date(),
              title: dest.title,
              slug: dest.slug,
              _id: dest._id,
            };
          }

          // Fallback to disk if destination has a local image path
          const localPath = dest.coverImage || dest.imageUrl;
          if (localPath && typeof localPath === 'string') {
            const diskFile = await this.readLocalImageFile(localPath);
            if (diskFile) {
              return {
                ...diskFile,
                publicationStatus: dest.publicationStatus,
                updatedAt: dest.updatedAt || dest.createdAt || new Date(),
                title: dest.title,
                slug: dest.slug,
                _id: dest._id,
              };
            }
          }
          return null;
        }
      } catch (e) {
        console.warn('[StoreService] Mongo getDestinationImage error:', e.message);
      }
    }

    // 2. Fallback to resilient in-memory store
    const memDest = this.destinations.find(
      (d) => !d.isDeleted && (d._id === cleanIdOrSlug || d.slug?.toLowerCase() === lowerSlug)
    );
    if (memDest) {
      if (memDest.image && memDest.image.data) {
        return {
          buffer: Buffer.isBuffer(memDest.image.data) ? memDest.image.data : Buffer.from(memDest.image.data),
          contentType: memDest.image.contentType || 'image/jpeg',
          originalName: memDest.image.originalName || `${memDest.slug}.jpg`,
          size: memDest.image.size || memDest.image.data.length,
          publicationStatus: memDest.publicationStatus,
          updatedAt: memDest.updatedAt || memDest.createdAt || new Date(),
          title: memDest.title,
          slug: memDest.slug,
          _id: memDest._id,
        };
      }

      const localPath = memDest.coverImage || memDest.imageUrl;
      if (localPath && typeof localPath === 'string') {
        const diskFile = await this.readLocalImageFile(localPath);
        if (diskFile) {
          return {
            ...diskFile,
            publicationStatus: memDest.publicationStatus,
            updatedAt: memDest.updatedAt || memDest.createdAt || new Date(),
            title: memDest.title,
            slug: memDest.slug,
            _id: memDest._id,
          };
        }
      }
    }

    return null;
  }

  async saveDestinationImageDirect(idOrSlug, inputData, originalName = '', author = 'Master Head') {
    await this.initializeSeedAccounts();
    const parsed = parseAndValidateImage(inputData, originalName);
    if (!parsed) {
      throw new Error('Valid image data is required.');
    }

    return await this.updateDestination(
      idOrSlug,
      {
        imageData: parsed.buffer,
        imageOriginalName: parsed.originalName,
      },
      author
    );
  }

  async readLocalImageFile(filePath) {
    try {
      if (!filePath || filePath.startsWith('http://') || filePath.startsWith('https://')) {
        return null;
      }
      const cleanPath = filePath.replace(/^\/+/, '');
      const candidates = [
        path.resolve(cleanPath),
        path.resolve('server/public', cleanPath),
        path.resolve('server', cleanPath),
        path.resolve('client/public', cleanPath),
        path.resolve('public', cleanPath),
        path.resolve('../client/public', cleanPath),
      ];
      for (const cand of candidates) {
        if (fs.existsSync(cand) && fs.statSync(cand).isFile()) {
          const buffer = await fs.promises.readFile(cand);
          const sig = detectImageSignature(buffer);
          return {
            buffer,
            contentType: sig ? sig.mimeType : 'image/jpeg',
            originalName: path.basename(cand),
            size: buffer.length,
          };
        }
      }
    } catch (e) {}
    return null;
  }

  async getUploadedImageFallback(filename) {
    await this.initializeSeedAccounts();
    const cleanFilename = path.basename(filename);

    // 1. Check if any destination in MongoDB has this image data or references it
    if (this.isMongoLive()) {
      try {
        const dest = await Destination.findOne({
          $or: [
            { 'image.originalName': cleanFilename },
            { coverImage: { $regex: cleanFilename } },
            { imageUrl: { $regex: cleanFilename } },
          ],
          isDeleted: { $ne: true },
        }).select('+image.data');

        if (dest && dest.image && dest.image.data) {
          return {
            buffer: dest.image.data,
            contentType: dest.image.contentType || 'image/jpeg',
            size: dest.image.size || dest.image.data.length,
            originalName: dest.image.originalName || cleanFilename,
          };
        }
      } catch (e) {}
    }

    // 2. Check local disk candidate locations
    const diskFile = await this.readLocalImageFile(`/uploads/${cleanFilename}`);
    if (diskFile) {
      return diskFile;
    }

    // 3. Fallback to resilient in-memory store
    const memDest = this.destinations.find(
      (d) =>
        !d.isDeleted &&
        (d.image?.originalName === cleanFilename ||
          d.coverImage?.includes(cleanFilename) ||
          d.imageUrl?.includes(cleanFilename))
    );
    if (memDest && memDest.image && memDest.image.data) {
      return {
        buffer: Buffer.isBuffer(memDest.image.data) ? memDest.image.data : Buffer.from(memDest.image.data),
        contentType: memDest.image.contentType || 'image/jpeg',
        size: memDest.image.size || memDest.image.data.length,
        originalName: memDest.image.originalName || cleanFilename,
      };
    }

    return null;
  }

  async deleteDestination(idOrSlug, author = 'Master Head') {
    await this.initializeSeedAccounts();
    if (this.isMongoLive()) {
      try {
        const destDoc = await Destination.findOne({ $or: [{ _id: idOrSlug }, { slug: idOrSlug }] });
        if (destDoc) {
          destDoc.isDeleted = true;
          destDoc.publicationStatus = 'archived';
          destDoc.updatedBy = author;
          await destDoc.save();
          const idx = this.destinations.findIndex((d) => d._id === idOrSlug || d.slug === idOrSlug);
          if (idx !== -1) {
            this.destinations[idx].isDeleted = true;
            this.destinations[idx].publicationStatus = 'archived';
          }
          await this.logAudit('DESTINATION_DELETED', author, 'destination', destDoc.slug);
          return { success: true, message: `Destination '${destDoc.title}' soft-deleted successfully.` };
        }
      } catch (e) {
        console.warn('[StoreService] Mongo deleteDestination error:', e.message);
      }
    }

    const dest = this.destinations.find((d) => d._id === idOrSlug || d.slug === idOrSlug);
    if (!dest) throw new Error(`Destination '${idOrSlug}' not found.`);

    dest.isDeleted = true;
    dest.publicationStatus = 'archived';
    dest.updatedBy = author;
    await this.logAudit('DESTINATION_DELETED', author, 'destination', dest.slug);
    return { success: true, message: `Destination '${dest.title}' soft-deleted successfully.` };
  }

  // ==================== ACTIVITIES MANAGEMENT ====================
  async getActivities(filter = {}) {
    await this.initializeSeedAccounts();
    if (this.isMongoLive()) {
      try {
        const q = { isDeleted: { $ne: true } };
        if (filter.category && filter.category !== 'All') {
          q.category = new RegExp(`^${filter.category.trim()}$`, 'i');
        }
        if (filter.region && filter.region !== 'All') {
          q.region = new RegExp(`^${filter.region.trim()}$`, 'i');
        }
        if (filter.featured !== undefined) q.featured = filter.featured;
        if (filter.publicationStatus) q.publicationStatus = filter.publicationStatus;
        if (filter.search) {
          const s = filter.search.trim();
          q.$or = [
            { title: { $regex: s, $options: 'i' } },
            { location: { $regex: s, $options: 'i' } },
            { description: { $regex: s, $options: 'i' } },
          ];
        }
        const docs = await Activity.find(q).sort({ displayOrder: 1, createdAt: -1 }).lean();
        if (docs && docs.length > 0) return docs;
      } catch (e) {}
    }

    let results = this.activities.filter((a) => !a.isDeleted);
    if (filter.category && filter.category !== 'All') {
      results = results.filter((a) => a.category?.toLowerCase() === filter.category.toLowerCase());
    }
    if (filter.region && filter.region !== 'All') {
      results = results.filter((a) => a.region?.toLowerCase() === filter.region.toLowerCase());
    }
    if (filter.featured !== undefined) {
      results = results.filter((a) => Boolean(a.featured) === Boolean(filter.featured));
    }
    if (filter.publicationStatus) {
      results = results.filter((a) => a.publicationStatus === filter.publicationStatus);
    }
    if (filter.search) {
      const s = filter.search.toLowerCase();
      results = results.filter(
        (a) =>
          (a.title && a.title.toLowerCase().includes(s)) ||
          (a.location && a.location.toLowerCase().includes(s)) ||
          (a.description && a.description.toLowerCase().includes(s))
      );
    }
    return results.sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));
  }

  async getActivityBySlug(slugOrId) {
    await this.initializeSeedAccounts();
    const clean = String(slugOrId).toLowerCase().trim();
    if (this.isMongoLive()) {
      try {
        const found = await Activity.findOne({
          $or: [{ slug: clean }, { _id: slugOrId }],
          isDeleted: { $ne: true },
        }).lean();
        if (found) return found;
      } catch (e) {}
    }
    return (
      this.activities.find(
        (a) => (a.slug?.toLowerCase() === clean || a._id === slugOrId || a.id === slugOrId) && !a.isDeleted
      ) || null
    );
  }

  async getActivityById(id) {
    return this.getActivityBySlug(id);
  }

  async createActivity(data, author = 'Master Head') {
    const slug =
      data.slug ||
      data.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
    const record = {
      ...data,
      _id: `act-${Date.now()}`,
      slug,
      shortDescription:
        data.shortDescription ||
        (data.description ? (data.description.length > 140 ? `${data.description.slice(0, 137)}...` : data.description) : ''),
      coverImage: data.coverImage || data.imageUrl || '/images/hero/hero-bg.jpg',
      imageUrl: data.imageUrl || data.coverImage || '/images/hero/hero-bg.jpg',
      displayOrder: Number(data.displayOrder) || this.activities.length + 1,
      publicationStatus: data.publicationStatus || 'published',
      isDeleted: false,
      createdBy: author,
      updatedBy: author,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    if (this.isMongoLive()) {
      try {
        const doc = await Activity.create(record);
        return doc.toObject();
      } catch (e) {}
    }
    this.activities.unshift(record);
    await this.logAudit('ACTIVITY_CREATED', author, 'activity', slug, { title: data.title });
    return record;
  }

  async updateActivity(idOrSlug, updateData, author = 'Master Head') {
    const act = this.activities.find(
      (a) =>
        a._id === idOrSlug ||
        a.id === idOrSlug ||
        a.slug === idOrSlug ||
        a.title?.toLowerCase() === String(idOrSlug).toLowerCase()
    );

    if (this.isMongoLive()) {
      try {
        const doc = await Activity.findOneAndUpdate(
          { $or: [{ _id: idOrSlug }, { slug: idOrSlug }] },
          { ...updateData, updatedBy: author, updatedAt: new Date().toISOString() },
          { new: true }
        ).lean();
        if (doc) {
          if (act) Object.assign(act, doc);
          await this.logAudit('ACTIVITY_UPDATED', author, 'activity', doc.slug, {
            updatedFields: Object.keys(updateData),
          });
          return doc;
        }
      } catch (e) {}
    }

    if (!act) throw new Error(`Activity '${idOrSlug}' not found.`);

    Object.assign(act, updateData, { updatedBy: author, updatedAt: new Date().toISOString() });
    await this.logAudit('ACTIVITY_UPDATED', author, 'activity', act.slug, {
      updatedFields: Object.keys(updateData),
    });
    return act;
  }

  async deleteActivity(idOrSlug, author = 'Master Head') {
    const act = this.activities.find((a) => a._id === idOrSlug || a.id === idOrSlug || a.slug === idOrSlug);

    if (this.isMongoLive()) {
      try {
        await Activity.findOneAndUpdate(
          { $or: [{ _id: idOrSlug }, { slug: idOrSlug }] },
          { isDeleted: true, publicationStatus: 'archived', updatedBy: author }
        );
      } catch (e) {}
    }

    if (act) {
      act.isDeleted = true;
      act.publicationStatus = 'archived';
      act.updatedBy = author;
    }

    await this.logAudit('ACTIVITY_DELETED', author, 'activity', String(idOrSlug));
    return { success: true, message: `Activity deleted/archived successfully.` };
  }

  // ==================== BOOKING ENQUIRIES ====================
  async createBooking(bookingData) {
    const enquiryNumber = this.generateCode('NEX-BK');
    const memberName = bookingData.memberName || `${bookingData.prefix || ''} ${bookingData.firstName || ''} ${bookingData.lastName || ''}`.trim();
    const customerName = memberName;
    const record = {
      ...bookingData,
      _id: `bk-${Date.now()}`,
      enquiryNumber,
      referenceNumber: enquiryNumber,
      memberName,
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

  // ==================== TRIP & PLAN AVAILABILITY ====================
  async getAvailabilities({ destination = '', packageTier = '', isAvailable = '', search = '', memberId = '' } = {}) {
    await this.initializeSeedAccounts();
    if (this.isMongoLive()) {
      try {
        const filter = {};
        if (destination) filter.destinationOrPlan = new RegExp(destination, 'i');
        if (packageTier && packageTier !== 'All') {
          filter.$or = [{ packageTier: 'All' }, { packageTier }];
        }
        if (isAvailable !== '') {
          filter.isAvailable = String(isAvailable) === 'true';
        }
        if (memberId && memberId !== 'ALL') {
          const mFilter = [
            { memberId: 'ALL' },
            { memberId: memberId.toUpperCase() },
            { memberId: { $exists: false } },
            { memberId: null },
          ];
          if (filter.$or) {
            filter.$and = [{ $or: filter.$or }, { $or: mFilter }];
            delete filter.$or;
          } else {
            filter.$or = mFilter;
          }
        }
        if (search) {
          const regex = new RegExp(search, 'i');
          const searchCondition = [{ title: regex }, { destinationOrPlan: regex }, { notes: regex }, { memberName: regex }];
          if (filter.$and) {
            filter.$and.push({ $or: searchCondition });
          } else if (filter.$or) {
            filter.$and = [{ $or: filter.$or }, { $or: searchCondition }];
            delete filter.$or;
          } else {
            filter.$or = searchCondition;
          }
        }
        return await PlanAvailability.find(filter).sort({ startDate: 1 }).lean();
      } catch (e) {
        console.error('[StoreService] Mongo getAvailabilities error:', e.message);
      }
    }

    let results = [...this.availabilities];
    if (memberId && memberId !== 'ALL') {
      const cleanMId = memberId.toUpperCase();
      results = results.filter((a) => !a.memberId || a.memberId === 'ALL' || a.memberId.toUpperCase() === cleanMId);
    }
    if (destination) {
      const q = destination.toLowerCase();
      results = results.filter((a) => a.destinationOrPlan.toLowerCase().includes(q));
    }
    if (packageTier && packageTier !== 'All') {
      results = results.filter((a) => a.packageTier === 'All' || a.packageTier === packageTier);
    }
    if (isAvailable !== '') {
      const reqAvail = String(isAvailable) === 'true';
      results = results.filter((a) => a.isAvailable === reqAvail);
    }
    if (search) {
      const q = search.toLowerCase();
      results = results.filter(
        (a) =>
          a.title.toLowerCase().includes(q) ||
          a.destinationOrPlan.toLowerCase().includes(q) ||
          (a.memberName && a.memberName.toLowerCase().includes(q)) ||
          (a.notes && a.notes.toLowerCase().includes(q))
      );
    }
    return results.sort((a, b) => (a.startDate > b.startDate ? 1 : -1));
  }

  async createAvailability(data, author = 'Master Administrator') {
    await this.initializeSeedAccounts();
    if (new Date(data.endDate) < new Date(data.startDate)) {
      throw new Error('Trip end date cannot be earlier than start date.');
    }

    const id = `avail-${Date.now()}`;
    const cleanMemberId = data.memberId ? data.memberId.toUpperCase().trim() : 'ALL';
    const cleanMemberName = data.memberName
      ? data.memberName.trim()
      : (cleanMemberId !== 'ALL' ? cleanMemberId : 'All Members');

    const record = {
      _id: id,
      id,
      memberId: cleanMemberId,
      memberName: cleanMemberName,
      title: data.title.trim(),
      destinationOrPlan: data.destinationOrPlan.trim(),
      packageTier: data.packageTier || 'All',
      startDate: data.startDate,
      endDate: data.endDate,
      isAvailable: data.isAvailable !== undefined ? Boolean(data.isAvailable) : true,
      availableSeats: Number(data.availableSeats || 10),
      bookedSeats: Number(data.bookedSeats || 0),
      notes: (data.notes || '').trim(),
      createdBy: author,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    if (this.isMongoLive()) {
      try {
        const doc = await PlanAvailability.create(record);
        await this.logAudit('CREATE_PLAN_AVAILABILITY', author, 'PlanAvailability', String(doc._id), {
          title: record.title,
          period: `${record.startDate} to ${record.endDate}`,
          memberId: record.memberId,
        });
        return doc.toObject ? doc.toObject() : doc;
      } catch (e) {
        console.error('[StoreService] Mongo PlanAvailability.create error:', e.message);
      }
    }

    this.availabilities.unshift(record);
    await this.logAudit('CREATE_PLAN_AVAILABILITY', author, 'PlanAvailability', id, {
      title: record.title,
      period: `${record.startDate} to ${record.endDate}`,
      memberId: record.memberId,
    });
    return record;
  }

  async updateAvailability(id, updateData, author = 'Master Administrator') {
    await this.initializeSeedAccounts();
    const index = this.availabilities.findIndex((a) => a._id === id || a.id === id);
    if (index === -1) {
      throw new Error(`Availability record '${id}' not found.`);
    }

    if (updateData.startDate && updateData.endDate) {
      if (new Date(updateData.endDate) < new Date(updateData.startDate)) {
        throw new Error('Trip end date cannot be earlier than start date.');
      }
    }

    const updated = {
      ...this.availabilities[index],
      ...updateData,
      updatedAt: new Date().toISOString(),
    };
    this.availabilities[index] = updated;

    if (this.isMongoLive()) {
      try {
        await PlanAvailability.findOneAndUpdate({ $or: [{ _id: id }, { id }] }, { $set: updateData });
      } catch (e) {}
    }

    await this.logAudit('UPDATE_PLAN_AVAILABILITY', author, 'PlanAvailability', id, {
      title: updated.title,
      isAvailable: updated.isAvailable,
      updatedFields: Object.keys(updateData),
    });
    return updated;
  }

  async deleteAvailability(id, author = 'Master Administrator') {
    await this.initializeSeedAccounts();
    const target = this.availabilities.find((a) => a._id === id || a.id === id);
    this.availabilities = this.availabilities.filter((a) => a._id !== id && a.id !== id);

    if (this.isMongoLive()) {
      try {
        await PlanAvailability.findOneAndDelete({ $or: [{ _id: id }, { id }] });
      } catch (e) {}
    }

    await this.logAudit('DELETE_PLAN_AVAILABILITY', author, 'PlanAvailability', id, {
      title: target?.title || id,
    });
    return { success: true };
  }
}

export const store = new ResilientStore();
