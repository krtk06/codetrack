import type { Request, Response, NextFunction } from 'express';
import {
  register,
  login,
  logout,
  refresh,
  verifyEmail,
  forgotPassword,
  resetPassword,
  changePassword
} from './auth.service.js';
import { asyncHandler } from '../../common/asyncHandler.js';
import type { TokenPayload } from '../../common/jwt.js';

export const registerController = asyncHandler(async (req: Request, res: Response) => {
  const result = await register(req.body);
  res.status(201).json(result);
});

export const loginController = asyncHandler(async (req: Request, res: Response) => {
  const result = await login(req.body);
  res.status(200).json(result);
});

export const logoutController = asyncHandler(async (req: Request, res: Response) => {
  const { refreshToken } = req.body;
  await logout(refreshToken);
  res.status(204).send();
});

export const refreshController = asyncHandler(async (req: Request, res: Response) => {
  const { refreshToken } = req.body;
  const result = await refresh(refreshToken);
  res.status(200).json(result);
});

export const verifyEmailController = asyncHandler(async (req: Request, res: Response) => {
  const { token } = req.params;
  await verifyEmail(token);
  res.status(302).redirect(`${process.env.FRONTEND_URL ?? 'http://localhost:5173'}/login?verified=true`);
});

export const forgotPasswordController = asyncHandler(async (req: Request, res: Response) => {
  await forgotPassword(req.body.email);
  res.status(202).send();
});

export const resetPasswordController = asyncHandler(async (req: Request, res: Response) => {
  await resetPassword(req.body);
  res.status(204).send();
});

export const changePasswordController = asyncHandler(async (req: Request, res: Response) => {
  const user = req.user as TokenPayload;
  await changePassword({ userId: user.userId, ...req.body });
  res.status(204).send();
});

export const getMeController = asyncHandler(async (req: Request, res: Response) => {
  const user = req.user as TokenPayload;
  res.status(200).json({
    user: {
      userId: user.userId,
      email: user.email,
      role: user.role
    }
  });
});
