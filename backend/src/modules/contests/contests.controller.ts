import type { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { createContest, getContests, importCodeforcesContests } from './contests.service.js';
import { badRequest } from '../../common/errors.js';

const importSchema = z.object({
  handle: z.string().min(1)
});

const createSchema = z.object({
  platform: z.enum(['LEETCODE', 'CODEFORCES', 'CODECHEF']),
  externalContestId: z.string().nullable().optional(),
  contestName: z.string().min(1),
  date: z.string().min(1),
  rank: z.number().int().nonnegative(),
  solved: z.number().int().nonnegative().optional(),
  ratingBefore: z.number().int().nullable().optional(),
  ratingAfter: z.number().int().nullable().optional()
});

export async function importCodeforcesController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const parsed = importSchema.safeParse(req.body);
    if (!parsed.success) {
      return next(badRequest('A Codeforces handle is required'));
    }
    const contests = await importCodeforcesContests(req.user!.userId, parsed.data.handle);
    res.json({ contests });
  } catch (error) {
    next(error);
  }
}

export async function createContestController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const parsed = createSchema.safeParse(req.body);
    if (!parsed.success) {
      return next(badRequest('Invalid contest payload'));
    }
    const contest = await createContest(req.user!.userId, parsed.data);
    res.status(201).json({ contest });
  } catch (error) {
    next(error);
  }
}

export async function getContestsController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const contests = await getContests(req.user!.userId);
    res.json({ contests });
  } catch (error) {
    next(error);
  }
}
