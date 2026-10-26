import { Router } from 'express';
import {
  getDestinations,
  getDestinationBySlug,
  createDestination,
  updateDestination,
  deleteDestination,
} from '../controllers/destinationController.js';
import { authenticate, requireRole, requirePermission } from '../middleware/auth.js';

const router = Router();

// Public discovery
router.get('/', getDestinations);
router.get('/:slug', getDestinationBySlug);

// Staff and Master Head management
router.post(
  '/',
  authenticate,
  requireRole(['master_head', 'employee']),
  requirePermission('add_destinations'),
  createDestination
);

router.patch(
  '/:id',
  authenticate,
  requireRole(['master_head', 'employee']),
  requirePermission('edit_destinations'),
  updateDestination
);

router.delete(
  '/:id',
  authenticate,
  requireRole(['master_head', 'employee']),
  requirePermission('delete_destinations'),
  deleteDestination
);

export default router;
