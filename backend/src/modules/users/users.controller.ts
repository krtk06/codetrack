import type { Request, Response, NextFunction } from 'express';
import { findUserById, updateUser, toUserResponse } from './users.service.js';
import { notFound } from '../../common/errors.js';

export async function getMeController(req: Request, res: Response, next: NextFunction) {
  try {
    const user = await findUserById(req.user!.userId);
    if (!user) {
      return next(notFound('User not found'));
    }

    res.json({ user: toUserResponse(user) });
  } catch (error) {
    next(error);
  }
}

export async function updateMeController(req: Request, res: Response, next: NextFunction) {
  try {
    const user = await updateUser(req.user!.userId, req.body);
    res.json({ user });
  } catch (error) {
    next(error);
  }
}
