import type { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import {
  createContest,
  createContests,
  getContests,
  importCodechefCsv,
  importCodeforcesContests
} from './contests.service.js';
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

const csvImportSchema = z.object({
  csv: z.string().min(1)
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
    if (Array.isArray(req.body)) {
      const parsed = z.array(createSchema).safeParse(req.body);
      if (!parsed.success) {
        return next(badRequest('Invalid contest payload'));
      }
      const contests = await createContests(req.user!.userId, parsed.data);
      res.status(201).json({ contests });
      return;
    }

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

export async function importCodechefController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    let csv: string | undefined;
    const contentType = req.headers['content-type'] ?? '';

    if (contentType.includes('text/csv')) {
      csv = typeof req.body === 'string' ? req.body : undefined;
    } else {
      const parsed = csvImportSchema.safeParse(req.body);
      if (!parsed.success) {
        return next(badRequest('CSV payload is required'));
      }
      csv = parsed.data.csv;
    }

    if (!csv) {
      return next(badRequest('CSV payload is required'));
    }

    const contests = await importCodechefCsv(req.user!.userId, csv);
    res.status(201).json({ contests });
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
