import { Router } from 'express';
import {
  registerController,
  loginController,
  logoutController,
  refreshController,
  verifyEmailController,
  forgotPasswordController,
  resetPasswordController,
  changePasswordController,
  getMeController
} from './auth.controller.js';
import {
  registerSchema,
  loginSchema,
  refreshSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  changePasswordSchema
} from './auth.validator.js';
import { validate } from '../../common/validate.js';
import { requireAuth } from '../../middleware/auth.js';

const router = Router();

router.post('/register', validate(registerSchema), registerController);
router.post('/login', validate(loginSchema), loginController);
router.post('/logout', validate(refreshSchema), logoutController);
router.post('/refresh', validate(refreshSchema), refreshController);
router.get('/verify-email/:token', verifyEmailController);
router.post('/forgot-password', validate(forgotPasswordSchema), forgotPasswordController);
router.post('/reset-password', validate(resetPasswordSchema), resetPasswordController);
router.post('/change-password', requireAuth, validate(changePasswordSchema), changePasswordController);
router.get('/me', requireAuth, getMeController);

export default router;
