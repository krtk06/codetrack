import type { Request, Response, NextFunction } from 'express';
import { getDashboard } from './dashboard.service.js';

export async function getDashboardController(req: Request, res: Response, next: NextFunction) {
  try {
    const dashboard = await getDashboard(req.user!.userId);
    res.json(dashboard);
  } catch (error) {
    next(error);
  }
}
