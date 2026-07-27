import { Router } from 'express';
import {
  getPreferencesController,
  getScheduledJobsController,
  updatePreferencesController
} from './notifications.controller.js';
import { requireAuth } from '../../middleware/auth.js';

const router = Router();

router.get('/preferences', requireAuth, getPreferencesController);
router.patch('/preferences', requireAuth, updatePreferencesController);
router.get('/jobs', requireAuth, getScheduledJobsController);

export default router;
