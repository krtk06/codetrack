import type { Request, Response, NextFunction } from 'express';
import { generateRecommendations } from './recommendations.service.js';

export async function getRecommendationsController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const recommendations = await generateRecommendations(req.user!.userId);
    res.json(recommendations);
  } catch (error) {
    next(error);
  }
}
