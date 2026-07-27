import { Router } from 'express';
import {
  getRecommendationsController,
  getStatsController,
  getUsageController,
  getUsersController
} from './admin.controller.js';
import { requireAuth, requireRole } from '../../middleware/auth.js';

const router = Router();

router.use(requireAuth, requireRole('ADMIN'));

router.get('/users', getUsersController);
router.get('/stats', getStatsController);
router.get('/recommendations', getRecommendationsController);
router.get('/usage', getUsageController);

export default router;
