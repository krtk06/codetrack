import type { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import {
  getPreferences,
  getScheduledJobs,
  updatePreferences
} from './notifications.service.js';
import { badRequest } from '../../common/errors.js';

const updateSchema = z
  .object({
    dailyReminders: z.boolean().optional(),
    goalCompletionAlerts: z.boolean().optional(),
    interviewNotifications: z.boolean().optional(),
    contestNotifications: z.boolean().optional()
  })
  .strict();

export async function getPreferencesController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const preferences = await getPreferences(req.user!.userId);
    res.json(preferences);
  } catch (error) {
    next(error);
  }
}

export async function updatePreferencesController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const parsed = updateSchema.safeParse(req.body);
    if (!parsed.success) {
      return next(badRequest('Invalid preferences payload'));
    }
    const preferences = await updatePreferences(req.user!.userId, parsed.data);
    res.json(preferences);
  } catch (error) {
    next(error);
  }
}

export async function getScheduledJobsController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    res.json(getScheduledJobs());
  } catch (error) {
    next(error);
  }
}
