import { Router } from 'express';
import { getGrowthController } from './analytics.controller.js';
import { requireAuth } from '../../middleware/auth.js';

const router = Router();

router.get('/growth', requireAuth, getGrowthController);

export default router;
