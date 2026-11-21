import { Router } from 'express';
import {
  getPackages,
  getPackageBySlug,
  getPackageImage,
  uploadPackageImage,
  createPackage,
  updatePackage,
  deletePackage,
} from '../controllers/packageController.js';
import { authenticate, optionalAuthenticate, requireRole } from '../middleware/auth.js';

const router = Router();

// Public discovery and binary image streaming
router.get('/', optionalAuthenticate, getPackages);
router.get('/:id/image', optionalAuthenticate, getPackageImage);
router.get('/:slug/image', optionalAuthenticate, getPackageImage);
router.get('/:slug', optionalAuthenticate, getPackageBySlug);

// Master Head exclusive management routes
router.post(
  '/',
  authenticate,
  requireRole(['master_head']),
  createPackage
);

router.post(
  '/:id/image',
  authenticate,
  requireRole(['master_head']),
  uploadPackageImage
);

router.patch(
  '/:id',
  authenticate,
  requireRole(['master_head']),
  updatePackage
);

router.delete(
  '/:id',
  authenticate,
  requireRole(['master_head']),
  deletePackage
);

export default router;
