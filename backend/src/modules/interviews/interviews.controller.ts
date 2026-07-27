import type { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import {
  createInterview,
  deleteInterview,
  getInterviews,
  getUpcomingInterviews,
  updateInterview
} from './interviews.service.js';
import { badRequest } from '../../common/errors.js';

const createSchema = z.object({
  company: z.string().min(1),
  round: z.string().min(1),
  date: z.string().min(1),
  time: z.string().min(1),
  location: z.string().nullable().optional(),
  meetingLink: z.string().url().nullable().optional(),
  status: z.enum(['SCHEDULED', 'COMPLETED', 'CANCELLED']).optional()
});

const updateSchema = createSchema.partial();

export async function createInterviewController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const parsed = createSchema.safeParse(req.body);
    if (!parsed.success) {
      return next(badRequest('Invalid interview payload'));
    }
    const interview = await createInterview(req.user!.userId, parsed.data);
    res.status(201).json({ interview });
  } catch (error) {
    next(error);
  }
}

export async function getInterviewsController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const interviews = await getInterviews(req.user!.userId);
    res.json({ interviews });
  } catch (error) {
    next(error);
  }
}

export async function getUpcomingInterviewsController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const interviews = await getUpcomingInterviews(req.user!.userId);
    res.json({ interviews });
  } catch (error) {
    next(error);
  }
}

export async function updateInterviewController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const parsed = updateSchema.safeParse(req.body);
    if (!parsed.success) {
      return next(badRequest('Invalid interview payload'));
    }
    const interview = await updateInterview(req.user!.userId, req.params.id, parsed.data);
    res.json({ interview });
  } catch (error) {
    next(error);
  }
}

export async function deleteInterviewController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    await deleteInterview(req.user!.userId, req.params.id);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
}
