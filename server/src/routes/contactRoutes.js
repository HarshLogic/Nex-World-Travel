import { Router } from 'express';
import { createContact, getContacts } from '../controllers/contactController.js';
import { submissionLimiter } from '../middleware/rateLimiter.js';
import { requireAdmin } from '../middleware/auth.js';

const router = Router();

router.post('/', submissionLimiter, createContact);
router.get('/', requireAdmin, getContacts);

export default router;
