import {
  validateCreateMember,
  validateUpdateMember,
  validateRecordPayment,
} from '../validators/memberValidator.js';
import { store } from '../services/storeService.js';

export const getMembers = async (req, res, next) => {
  try {
    const { page, limit, search, status, packageType } = req.query;
    const result = await store.getMembers({ page, limit, search, status, packageType });

    res.json({
      success: true,
      ...result,
    });
  } catch (error) {
    next(error);
  }
};

export const getMemberById = async (req, res, next) => {
  try {
    const memberId = req.params.id || req.params.memberId;
    const member = await store.getMemberById(memberId);

    if (!member) {
      return res.status(404).json({
        success: false,
        message: `Member profile '${memberId}' was not found.`,
      });
    }

    const payments = await store.getMemberPayments(memberId);
    const requests = await store.getMemberRequests({ memberId });

    res.json({
      success: true,
      member,
      payments,
      requests,
    });
  } catch (error) {
    next(error);
  }
};

export const getMyProfile = async (req, res, next) => {
  try {
    if (!req.user || req.user.role !== 'member') {
      return res.status(403).json({ success: false, message: 'Access restricted to members.' });
    }

    const member = await store.getMemberById(req.user.memberId);
    if (!member) {
      return res.status(404).json({ success: false, message: 'Membership record not found.' });
    }

    const payments = await store.getMemberPayments(req.user.memberId);
    const requests = await store.getMemberRequests({ memberId: req.user.memberId });
    const terms = await store.getTerms();

    res.json({
      success: true,
      member,
      payments,
      requests,
      terms,
    });
  } catch (error) {
    next(error);
  }
};

export const createMember = async (req, res, next) => {
  try {
    const validation = validateCreateMember(req.body);
    if (!validation.success) {
      return res.status(400).json({
        success: false,
        message: 'Invalid member data provided.',
        errors: validation.error.errors.map((e) => ({ field: e.path.join('.'), message: e.message })),
      });
    }

    const author = req.user ? `${req.user.name} (${req.user.email})` : 'Master Head';
    const member = await store.createMember(validation.data, author);

    res.status(201).json({
      success: true,
      message: `Member account '${member.memberId}' created successfully.`,
      member,
    });
  } catch (error) {
    next(error);
  }
};

export const updateMember = async (req, res, next) => {
  try {
    const memberId = req.params.id || req.params.memberId;
    const validation = validateUpdateMember(req.body);

    if (!validation.success) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed on member update.',
        errors: validation.error.errors.map((e) => e.message),
      });
    }

    // Role-based protection: Employees cannot alter package or financial fields directly
    if (req.user && req.user.role === 'employee') {
      const protectedFields = [
        'packageType',
        'productPrice',
        'nightsAvailable',
        'tenurePeriod',
        'extraOffers',
        'travelCardBenefit',
        'emiDetails',
        'totalAmountPaid',
        'outstandingBalance',
      ];
      const hasProtectedField = protectedFields.some(
        (field) => validation.data[field] !== undefined && validation.data[field] !== null
      );

      if (hasProtectedField) {
        return res.status(403).json({
          success: false,
          requiresApproval: true,
          message:
            'Employees cannot directly alter package tiers, nights, or financial terms. Please submit an Employee Change Request for Master Head approval.',
        });
      }
    }

    const author = req.user ? `${req.user.name} (${req.user.email})` : 'Staff';
    const updated = await store.updateMember(memberId, validation.data, author);

    res.json({
      success: true,
      message: `Member '${memberId}' updated successfully.`,
      member: updated,
    });
  } catch (error) {
    next(error);
  }
};

export const recordPayment = async (req, res, next) => {
  try {
    const memberId = req.params.id || req.params.memberId;
    const validation = validateRecordPayment(req.body);

    if (!validation.success) {
      return res.status(400).json({
        success: false,
        message: 'Invalid payment record information.',
        errors: validation.error.errors.map((e) => e.message),
      });
    }

    const author = req.user ? `${req.user.name} (${req.user.email})` : 'Staff';
    const payment = await store.recordPayment(memberId, validation.data, author);
    const updatedMember = await store.getMemberById(memberId);

    res.status(201).json({
      success: true,
      message: `Payment of AED ${payment.amount} recorded for member '${memberId}'.`,
      payment,
      member: updatedMember,
    });
  } catch (error) {
    next(error);
  }
};

export const getMemberPayments = async (req, res, next) => {
  try {
    const memberId = req.params.id || req.params.memberId;
    const payments = await store.getMemberPayments(memberId);

    res.json({
      success: true,
      count: payments.length,
      payments,
    });
  } catch (error) {
    next(error);
  }
};

export const acknowledgeTerms = async (req, res, next) => {
  try {
    if (!req.user || req.user.role !== 'member') {
      return res.status(403).json({ success: false, message: 'Access restricted to members.' });
    }

    const terms = await store.getTerms();
    await store.updateMember(req.user.memberId, {
      termsAccepted: true,
      termsAcceptedAt: new Date().toISOString(),
      termsVersion: terms.version,
    }, req.user.memberId);

    res.json({
      success: true,
      message: 'Terms & conditions acknowledged successfully.',
    });
  } catch (error) {
    next(error);
  }
};

