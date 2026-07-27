import { Router } from 'express';
import { getHeatmapController } from './heatmap.controller.js';
import { requireAuth } from '../../middleware/auth.js';

const router = Router();

router.get('/', requireAuth, getHeatmapController);

export default router;
