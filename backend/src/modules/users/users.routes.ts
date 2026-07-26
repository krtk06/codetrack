import { Router } from 'express';
import { getMeController, updateMeController } from './users.controller.js';
import { updateUserSchema } from './users.validator.js';
import { validate } from '../../common/validate.js';
import { requireAuth } from '../../middleware/auth.js';

const router = Router();

router.get('/me', requireAuth, getMeController);
router.patch('/me', requireAuth, validate(updateUserSchema), updateMeController);

export default router;
