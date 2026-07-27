import { Router } from 'express';
import {
  getCompanyPrepController,
  getSupportedCompaniesController
} from './companies.controller.js';
import { requireAuth } from '../../middleware/auth.js';

const router = Router();

router.get('/companies', requireAuth, getSupportedCompaniesController);
router.get('/prep', requireAuth, getCompanyPrepController);

export default router;
