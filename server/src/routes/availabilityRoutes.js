import { Router } from 'express';
import {
  getAvailabilities,
  createAvailability,
  updateAvailability,
  deleteAvailability,
} from '../controllers/availabilityController.js';
import { authenticate, requireRole } from '../middleware/auth.js';

const router = Router();

// Availability dates query - open to members and staff
router.get('/', getAvailabilities);

// Availability management
router.post('/', authenticate, requireRole(['master_head', 'employee']), createAvailability);
router.patch('/:id', authenticate, requireRole(['master_head', 'employee']), updateAvailability);
router.delete('/:id', authenticate, requireRole(['master_head']), deleteAvailability);

export default router;

