import { Router } from 'express';
import {
  createApplicationController,
  deleteApplicationController,
  getApplicationsController,
  updateApplicationController
} from './applications.controller.js';
import { requireAuth } from '../../middleware/auth.js';

const router = Router();

router.get('/', requireAuth, getApplicationsController);
router.post('/', requireAuth, createApplicationController);
router.patch('/:id', requireAuth, updateApplicationController);
router.delete('/:id', requireAuth, deleteApplicationController);

export default router;
