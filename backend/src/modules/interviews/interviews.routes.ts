import { Router } from 'express';
import {
  createInterviewController,
  deleteInterviewController,
  getInterviewsController,
  getUpcomingInterviewsController,
  updateInterviewController
} from './interviews.controller.js';
import { requireAuth } from '../../middleware/auth.js';

const router = Router();

router.get('/', requireAuth, getInterviewsController);
router.get('/upcoming', requireAuth, getUpcomingInterviewsController);
router.post('/', requireAuth, createInterviewController);
router.patch('/:id', requireAuth, updateInterviewController);
router.delete('/:id', requireAuth, deleteInterviewController);

export default router;
