import { Router } from 'express';
import {
  createContestController,
  getContestAnalysisController,
  getContestsController,
  importCodechefController,
  importCodeforcesController
} from './contests.controller.js';
import { requireAuth } from '../../middleware/auth.js';

const router = Router();

router.get('/', requireAuth, getContestsController);
router.get('/analysis', requireAuth, getContestAnalysisController);
router.post('/import/codeforces', requireAuth, importCodeforcesController);
router.post('/import/codechef/csv', requireAuth, importCodechefController);
router.post('/', requireAuth, createContestController);

export default router;
