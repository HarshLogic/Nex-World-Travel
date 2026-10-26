import { Router } from 'express';
import {
  createBooking,
  getBookings,
  updateBookingStatus,
  addBookingNote,
  retryBookingNotification,
} from '../controllers/bookingController.js';
import { submissionLimiter } from '../middleware/rateLimiter.js';
import { authenticate, requireRole, requirePermission } from '../middleware/auth.js';

const router = Router();

// Public booking submission with rate limiting
router.post('/', submissionLimiter, createBooking);

// Staff and Master Head booking management
router.get(
  '/',
  authenticate,
  requireRole(['master_head', 'employee']),
  requirePermission('manage_bookings'),
  getBookings
);

router.patch(
  '/:id',
  authenticate,
  requireRole(['master_head', 'employee']),
  requirePermission('manage_bookings'),
  updateBookingStatus
);

router.post(
  '/:id/notes',
  authenticate,
  requireRole(['master_head', 'employee']),
  requirePermission('manage_bookings'),
  addBookingNote
);

router.post(
  '/:id/notify',
  authenticate,
  requireRole(['master_head', 'employee']),
  requirePermission('manage_bookings'),
  retryBookingNotification
);

export default router;
