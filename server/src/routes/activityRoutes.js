import { Router } from 'express';
import {
  getActivities,
  getActivityBySlug,
  createActivity,
  updateActivity,
  deleteActivity,
} from '../controllers/activityController.js';
import { authenticate, requireRole } from '../middleware/auth.js';

const router = Router();

// Public discovery
router.get('/', getActivities);
router.get('/:slug', getActivityBySlug);

// Management (Master Head & Employee with management role)
router.post('/', authenticate, requireRole(['master_head', 'employee']), createActivity);
router.patch('/:id', authenticate, requireRole(['master_head', 'employee']), updateActivity);
router.delete('/:id', authenticate, requireRole(['master_head', 'employee']), deleteActivity);

export default router;
