import { Router } from 'express';
import {
  memberLogin,
  staffLogin,
  getCurrentUser,
  logout,
  forgotPassword,
  resetPassword,
  activateAccount,
  verifySecurityToken,
} from '../controllers/authController.js';
import { authenticate } from '../middleware/auth.js';
import { submissionLimiter } from '../middleware/rateLimiter.js';

const router = Router();

router.post('/member/login', submissionLimiter, memberLogin);
router.post('/staff/login', submissionLimiter, staffLogin);
router.get('/me', authenticate, getCurrentUser);
router.post('/logout', logout);

// Password Reset and Account Activation
router.post('/forgot-password', submissionLimiter, forgotPassword);
router.post('/reset-password', submissionLimiter, resetPassword);
router.post('/activate-account', submissionLimiter, activateAccount);
router.get('/verify-token', verifySecurityToken);

export default router;

