import { Router } from 'express';
import {
  createContestController,
  getContestsController,
  importCodeforcesController
} from './contests.controller.js';
import { requireAuth } from '../../middleware/auth.js';

const router = Router();

router.get('/', requireAuth, getContestsController);
router.post('/import/codeforces', requireAuth, importCodeforcesController);
router.post('/', requireAuth, createContestController);

export default router;
