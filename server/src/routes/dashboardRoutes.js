import { Router } from 'express';
import { getDashboardMetrics } from '../controllers/dashboardController.js';
import { authenticate, requireRole, requirePermission } from '../middleware/auth.js';

const router = Router();

router.get(
  '/metrics',
  authenticate,
  requireRole(['master_head', 'employee']),
  requirePermission('view_reports'),
  getDashboardMetrics
);

export default router;

