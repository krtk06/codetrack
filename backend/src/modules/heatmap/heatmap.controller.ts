import type { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { getHeatmap, summarizeHeatmap } from './heatmap.service.js';
import { badRequest } from '../../common/errors.js';

const querySchema = z.object({
  year: z.coerce.number().int().min(2000).max(2100)
});

export async function getHeatmapController(req: Request, res: Response, next: NextFunction) {
  try {
    const parseResult = querySchema.safeParse(req.query);
    if (!parseResult.success) {
      return next(badRequest('Invalid or missing year. Provide a year between 2000 and 2100.'));
    }

    const { year } = parseResult.data;
    const days = await getHeatmap(req.user!.userId, year);
    const summary = summarizeHeatmap(days);
    res.json({ days, summary });
  } catch (error) {
    next(error);
  }
}
