import { Router } from 'express';
import {
  createResumeController,
  deleteResumeController,
  getResumeStatsController,
  getResumesController
} from './resumes.controller.js';
import { requireAuth } from '../../middleware/auth.js';

const router = Router();

router.get('/', requireAuth, getResumesController);
router.get('/:id/stats', requireAuth, getResumeStatsController);
router.post('/', requireAuth, createResumeController);
router.delete('/:id', requireAuth, deleteResumeController);

export default router;
