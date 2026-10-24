import { Router } from 'express';
import { getDestinations, getDestinationBySlug } from '../controllers/destinationController.js';

const router = Router();

router.get('/', getDestinations);
router.get('/:slug', getDestinationBySlug);

export default router;

