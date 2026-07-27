import type { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { getGrowthData, type GrowthPeriod } from './analytics.service.js';
import { badRequest } from '../../common/errors.js';

const growthQuerySchema = z.object({
  period: z.enum(['weekly', 'monthly', 'yearly'])
});

export async function getGrowthController(req: Request, res: Response, next: NextFunction) {
  try {
    const parseResult = growthQuerySchema.safeParse(req.query);
    if (!parseResult.success) {
      return next(badRequest('Invalid period. Use weekly, monthly, or yearly.'));
    }

    const { period } = parseResult.data;
    const data = await getGrowthData(req.user!.userId, period as GrowthPeriod);
    res.json(data);
  } catch (error) {
    next(error);
  }
}
