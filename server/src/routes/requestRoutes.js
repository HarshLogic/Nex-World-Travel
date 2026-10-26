import { Router } from 'express';
import {
  createMemberRequest,
  getMyMemberRequests,
  getAdminMemberRequests,
  updateMemberRequest,
  createEmployeeChangeRequest,
  getMyChangeRequests,
  getAdminChangeRequests,
  approveChangeRequest,
  rejectChangeRequest,
} from '../controllers/requestController.js';
import {
  authenticate,
  requireRole,
  requirePermission,
} from '../middleware/auth.js';

const router = Router();

// ==================== MEMBER SUPPORT REQUESTS ====================
router.post(
  '/member-requests',
  authenticate,
  requireRole('member'),
  createMemberRequest
);

router.get(
  '/member-requests/my-requests',
  authenticate,
  requireRole('member'),
  getMyMemberRequests
);

router.get(
  '/member-requests',
  authenticate,
  requireRole(['master_head', 'employee']),
  getAdminMemberRequests
);

router.patch(
  '/member-requests/:id',
  authenticate,
  requireRole(['master_head', 'employee']),
  updateMemberRequest
);

// ==================== EMPLOYEE CHANGE REQUESTS ====================
router.post(
  '/change-requests',
  authenticate,
  requireRole('employee'),
  requirePermission('create_member_change_request'),
  createEmployeeChangeRequest
);

router.get(
  '/change-requests/my-requests',
  authenticate,
  requireRole('employee'),
  getMyChangeRequests
);

router.get(
  '/change-requests',
  authenticate,
  requireRole('master_head'),
  getAdminChangeRequests
);

router.post(
  '/change-requests/:id/approve',
  authenticate,
  requireRole('master_head'),
  approveChangeRequest
);

router.post(
  '/change-requests/:id/reject',
  authenticate,
  requireRole('master_head'),
  rejectChangeRequest
);

export default router;

