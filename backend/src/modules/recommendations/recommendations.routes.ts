import { Router } from 'express';
import { getRecommendationsController } from './recommendations.controller.js';
import { requireAuth } from '../../middleware/auth.js';

const router = Router();

router.get('/', requireAuth, getRecommendationsController);

export default router;
