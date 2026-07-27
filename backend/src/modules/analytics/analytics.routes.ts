import { Router } from 'express';
import { getGrowthController, getAnalyticsSummaryController } from './analytics.controller.js';
import { requireAuth } from '../../middleware/auth.js';

const router = Router();

router.get('/growth', requireAuth, getGrowthController);
router.get('/summary', requireAuth, getAnalyticsSummaryController);

export default router;
