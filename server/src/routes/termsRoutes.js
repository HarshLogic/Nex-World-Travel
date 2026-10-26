import { Router } from 'express';
import { getTerms, updateTerms } from '../controllers/termsController.js';
import { authenticate, requireRole } from '../middleware/auth.js';

const router = Router();

router.get('/', getTerms);
router.patch('/', authenticate, requireRole('master_head'), updateTerms);

export default router;

