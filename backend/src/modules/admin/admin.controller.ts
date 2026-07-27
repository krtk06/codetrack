import type { Request, Response, NextFunction } from 'express';
import {
  getAllRecommendations,
  getAllUsers,
  getStats,
  getUsage
} from './admin.service.js';

export async function getUsersController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const users = await getAllUsers();
    res.json({ users });
  } catch (error) {
    next(error);
  }
}

export async function getStatsController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    res.json(await getStats());
  } catch (error) {
    next(error);
  }
}

export async function getRecommendationsController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const recommendations = await getAllRecommendations();
    res.json({ recommendations });
  } catch (error) {
    next(error);
  }
}

export async function getUsageController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    res.json(getUsage());
  } catch (error) {
    next(error);
  }
}
