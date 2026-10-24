import { Router } from 'express';
import { getActivities, getActivityBySlug } from '../controllers/activityController.js';

const router = Router();

router.get('/', getActivities);
router.get('/:slug', getActivityBySlug);

export default router;

