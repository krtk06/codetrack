import type { Request, Response, NextFunction } from 'express';
import { getTopics, getTopicPerformance } from './topics.service.js';

export async function getTopicsController(req: Request, res: Response, next: NextFunction) {
  try {
    const topics = await getTopics();
    res.json({ topics });
  } catch (error) {
    next(error);
  }
}

export async function getTopicPerformanceController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const performance = await getTopicPerformance(req.user!.userId);
    res.json({ performance });
  } catch (error) {
    next(error);
  }
}
