import { Router } from 'express';
import { syncLeetCodeController } from './leetcode.controller.js';
import { requireAuth } from '../../middleware/auth.js';

const router = Router();

router.post('/:username/sync', requireAuth, syncLeetCodeController);

export default router;
