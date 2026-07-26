import { Router } from 'express';
import { syncLeetCodeController, getStatsController } from './leetcode.controller.js';
import { requireAuth } from '../../middleware/auth.js';

const router = Router();

router.get('/:username/stats', requireAuth, getStatsController);
router.post('/:username/sync', requireAuth, syncLeetCodeController);

export default router;
