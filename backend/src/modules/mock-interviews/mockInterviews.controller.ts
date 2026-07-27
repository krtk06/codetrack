import type { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import {
  createMockInterview,
  deleteMockInterview,
  getMockInterviewPerformance,
  getMockInterviews,
  updateMockInterview
} from './mockInterviews.service.js';
import { badRequest } from '../../common/errors.js';

const createSchema = z.object({
  date: z.string().min(1),
  interviewer: z.string().min(1),
  topic: z.string().min(1),
  score: z.number().int().nonnegative(),
  scoreOutOf: z.number().int().positive().optional(),
  feedback: z.string().nullable().optional()
});

const updateSchema = createSchema.partial();

export async function createMockInterviewController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const parsed = createSchema.safeParse(req.body);
    if (!parsed.success) {
      return next(badRequest('Invalid mock interview payload'));
    }
    const mock = await createMockInterview(req.user!.userId, parsed.data);
    res.status(201).json({ mockInterview: mock });
  } catch (error) {
    next(error);
  }
}

export async function getMockInterviewsController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const items = await getMockInterviews(req.user!.userId);
    res.json({ mockInterviews: items });
  } catch (error) {
    next(error);
  }
}

export async function updateMockInterviewController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const parsed = updateSchema.safeParse(req.body);
    if (!parsed.success) {
      return next(badRequest('Invalid mock interview payload'));
    }
    const mock = await updateMockInterview(req.user!.userId, req.params.id, parsed.data);
    res.json({ mockInterview: mock });
  } catch (error) {
    next(error);
  }
}

export async function deleteMockInterviewController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    await deleteMockInterview(req.user!.userId, req.params.id);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
}

export async function getMockInterviewPerformanceController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const performance = await getMockInterviewPerformance(req.user!.userId);
    res.json(performance);
  } catch (error) {
    next(error);
  }
}
