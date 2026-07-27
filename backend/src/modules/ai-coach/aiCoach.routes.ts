import { Router } from 'express';
import { analyzeFailureController } from './aiCoach.controller.js';
import { requireAuth } from '../../middleware/auth.js';

const router = Router();

router.post('/analyze', requireAuth, analyzeFailureController);

export default router;
