import { Router } from 'express';
import { getPackages, getPackageBySlug } from '../controllers/packageController.js';

const router = Router();

router.get('/', getPackages);
router.get('/:slug', getPackageBySlug);

export default router;
