import { Router } from 'express';
import { createBooking, getBookings } from '../controllers/bookingController.js';
import { submissionLimiter } from '../middleware/rateLimiter.js';
import { requireAdmin } from '../middleware/auth.js';

const router = Router();

router.post('/', submissionLimiter, createBooking);
router.get('/', requireAdmin, getBookings);

export default router;
