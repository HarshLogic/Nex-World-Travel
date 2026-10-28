import { Router } from 'express';
import { uploadMedia } from '../controllers/mediaController.js';
import { authenticate, requireRole } from '../middleware/auth.js';

const router = Router();

// Master Head and Employee can upload images
router.post('/upload', authenticate, requireRole(['master_head', 'employee']), uploadMedia);
router.post('/', authenticate, requireRole(['master_head', 'employee']), uploadMedia);

export default router;

