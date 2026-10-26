import {
  validateMemberRequest,
  validateEmployeeChangeRequest,
} from '../validators/requestValidator.js';
import { store } from '../services/storeService.js';

// ==================== MEMBER SUPPORT REQUESTS ====================
export const createMemberRequest = async (req, res, next) => {
  try {
    const validation = validateMemberRequest(req.body);
    if (!validation.success) {
      return res.status(400).json({
        success: false,
        message: 'Invalid request submission.',
        errors: validation.error.errors.map((e) => e.message),
      });
    }

    const member = req.user;
    const request = await store.createMemberRequest(validation.data, member);

    res.status(201).json({
      success: true,
      message: 'Your request has been submitted successfully. Our team will contact you within 24 hours.',
      request,
    });
  } catch (error) {
    next(error);
  }
};

export const getMyMemberRequests = async (req, res, next) => {
  try {
    const requests = await store.getMemberRequests({ memberId: req.user.memberId });
    res.json({
      success: true,
      count: requests.length,
      requests,
    });
  } catch (error) {
    next(error);
  }
};

export const getAdminMemberRequests = async (req, res, next) => {
  try {
    const { status, memberId } = req.query;
    const requests = await store.getMemberRequests({ status, memberId });

    res.json({
      success: true,
      count: requests.length,
      requests,
    });
  } catch (error) {
    next(error);
  }
};

export const updateMemberRequest = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, note } = req.body;
    const author = req.user ? `${req.user.name} (${req.user.email})` : 'Staff';

    const updated = await store.updateMemberRequest(id, { status, note }, author);

    res.json({
      success: true,
      message: `Request '${id}' status updated to ${updated.status}.`,
      request: updated,
    });
  } catch (error) {
    next(error);
  }
};

// ==================== EMPLOYEE CHANGE REQUESTS ====================
export const createEmployeeChangeRequest = async (req, res, next) => {
  try {
    const validation = validateEmployeeChangeRequest(req.body);
    if (!validation.success) {
      return res.status(400).json({
        success: false,
        message: 'Invalid change request data.',
        errors: validation.error.errors.map((e) => e.message),
      });
    }

    const employee = req.user;
    const changeRequest = await store.createChangeRequest(validation.data, employee);

    res.status(201).json({
      success: true,
      message: `Change request '${changeRequest.requestId}' submitted for Master Head review and approval.`,
      changeRequest,
    });
  } catch (error) {
    next(error);
  }
};

export const getMyChangeRequests = async (req, res, next) => {
  try {
    const changeRequests = await store.getChangeRequests({ employeeId: req.user.id });
    res.json({
      success: true,
      count: changeRequests.length,
      changeRequests,
    });
  } catch (error) {
    next(error);
  }
};

export const getAdminChangeRequests = async (req, res, next) => {
  try {
    const { status } = req.query;
    const changeRequests = await store.getChangeRequests({ status });
    res.json({
      success: true,
      count: changeRequests.length,
      changeRequests,
    });
  } catch (error) {
    next(error);
  }
};

export const approveChangeRequest = async (req, res, next) => {
  try {
    const { id } = req.params;
    const reviewer = req.user ? `${req.user.name} (${req.user.email})` : 'Master Head';

    const approved = await store.approveChangeRequest(id, reviewer);

    res.json({
      success: true,
      message: `Change request '${id}' approved and applied to target record successfully.`,
      changeRequest: approved,
    });
  } catch (error) {
    next(error);
  }
};

export const rejectChangeRequest = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { notes } = req.body;
    const reviewer = req.user ? `${req.user.name} (${req.user.email})` : 'Master Head';

    const rejected = await store.rejectChangeRequest(id, reviewer, notes);

    res.json({
      success: true,
      message: `Change request '${id}' has been rejected.`,
      changeRequest: rejected,
    });
  } catch (error) {
    next(error);
  }
};

