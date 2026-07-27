import { Router } from 'express';
import { getTopicsController, getTopicPerformanceController } from './topics.controller.js';
import { requireAuth } from '../../middleware/auth.js';

const router = Router();

router.get('/', getTopicsController);
router.get('/performance', requireAuth, getTopicPerformanceController);

export default router;
