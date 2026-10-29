import { Router } from 'express';
import {
  getActivities,
  getActivityBySlug,
  getActivityImage,
  uploadActivityImage,
  createActivity,
  updateActivity,
  deleteActivity,
} from '../controllers/activityController.js';
import { authenticate, optionalAuthenticate, requireRole } from '../middleware/auth.js';

const router = Router();

// Public discovery & image serving (with optionalAuthenticate for draft authorization check)
router.get('/', getActivities);
router.get('/:id/image', optionalAuthenticate, getActivityImage);
router.get('/:slug/image', optionalAuthenticate, getActivityImage);
router.get('/:slug', getActivityBySlug);

// Management (Master Head & Employee with management role)
router.post('/:id/image', authenticate, requireRole(['master_head', 'employee']), uploadActivityImage);
router.post('/', authenticate, requireRole(['master_head', 'employee']), createActivity);
router.patch('/:id', authenticate, requireRole(['master_head', 'employee']), updateActivity);
router.delete('/:id', authenticate, requireRole(['master_head', 'employee']), deleteActivity);

export default router;
