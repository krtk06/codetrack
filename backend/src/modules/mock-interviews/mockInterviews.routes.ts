import { Router } from 'express';
import {
  createMockInterviewController,
  deleteMockInterviewController,
  getMockInterviewPerformanceController,
  getMockInterviewsController,
  updateMockInterviewController
} from './mockInterviews.controller.js';
import { requireAuth } from '../../middleware/auth.js';

const router = Router();

router.get('/', requireAuth, getMockInterviewsController);
router.get('/performance', requireAuth, getMockInterviewPerformanceController);
router.post('/', requireAuth, createMockInterviewController);
router.patch('/:id', requireAuth, updateMockInterviewController);
router.delete('/:id', requireAuth, deleteMockInterviewController);

export default router;
