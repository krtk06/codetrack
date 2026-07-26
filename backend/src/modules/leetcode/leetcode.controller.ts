import type { Request, Response, NextFunction } from 'express';
import { syncLeetCodeForUser } from './leetcode.service.js';
import { notFound } from '../../common/errors.js';
import { prisma } from '../../config/database.js';

export async function syncLeetCodeController(req: Request, res: Response, next: NextFunction) {
  try {
    const username = req.params.username;
    const user = await prisma.user.findFirst({
      where: { leetcodeUsername: username }
    });

    if (!user) {
      return next(notFound('User not found'));
    }

    const result = await syncLeetCodeForUser(user.id, username);
    res.json({ stats: result.stats });
  } catch (error) {
    next(error);
  }
}
