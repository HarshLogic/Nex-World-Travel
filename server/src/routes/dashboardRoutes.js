import { Router } from 'express';
import { getDashboardMetrics, getSystemMemoryDiagnostics } from '../controllers/dashboardController.js';
import { authenticate, requireRole, requirePermission } from '../middleware/auth.js';

const router = Router();

router.get(
  '/metrics',
  authenticate,
  requireRole(['master_head', 'employee']),
  requirePermission('view_reports'),
  getDashboardMetrics
);

router.get(
  '/system/memory',
  authenticate,
  requireRole(['master_head', 'employee']),
  requirePermission('view_reports'),
  getSystemMemoryDiagnostics
);

export default router;

