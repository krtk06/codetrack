import type { Request, Response, NextFunction } from 'express';
import { analyzeFailure } from './aiCoach.service.js';

export async function analyzeFailureController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const failureDescription = (req.body?.failureDescription as string | undefined) ?? '';
    const result = await analyzeFailure(failureDescription);
    res.json(result);
  } catch (error) {
    next(error);
  }
}
