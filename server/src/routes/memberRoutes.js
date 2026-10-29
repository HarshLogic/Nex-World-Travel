import { Router } from 'express';
import {
  getMembers,
  getMemberById,
  getMyProfile,
  createMember,
  updateMember,
  recordPayment,
  getMemberPayments,
  acknowledgeTerms,
} from '../controllers/memberController.js';
import {
  authenticate,
  requireRole,
  requirePermission,
  requireMemberOwnership,
} from '../middleware/auth.js';

const router = Router();

// Member self routes
router.get('/me', authenticate, requireRole('member'), getMyProfile);
router.post('/acknowledge-terms', authenticate, requireRole('member'), acknowledgeTerms);

// Staff and Master Head routes
router.get(
  '/',
  authenticate,
  requireRole(['master_head', 'employee']),
  requirePermission(['view_members', 'create_member']),
  getMembers
);

router.post(
  '/',
  authenticate,
  requireRole(['master_head', 'employee']),
  requirePermission('create_member'),
  createMember
);

router.get(
  '/:id',
  authenticate,
  requireMemberOwnership,
  getMemberById
);

router.patch(
  '/:id',
  authenticate,
  requireRole(['master_head', 'employee']),
  requirePermission([
    'edit_member_details',
    'edit_membership_plans',
    'update_financial_info',
    'update_membership_status',
  ]),
  updateMember
);

router.post(
  '/:id/payments',
  authenticate,
  requireRole(['master_head', 'employee']),
  requirePermission('update_financial_info'),
  recordPayment
);

router.get(
  '/:id/payments',
  authenticate,
  requireMemberOwnership,
  getMemberPayments
);

export default router;

