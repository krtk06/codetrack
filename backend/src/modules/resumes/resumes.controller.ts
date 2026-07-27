import type { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import {
  createResume,
  deleteResume,
  getResumeStats,
  getResumes
} from './resumes.service.js';
import { badRequest } from '../../common/errors.js';

const createSchema = z.object({
  label: z.string().min(1),
  fileBase64: z.string().min(1),
  filename: z.string().min(1),
  mimeType: z.string().optional()
});

export async function createResumeController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const parsed = createSchema.safeParse(req.body);
    if (!parsed.success) {
      return next(badRequest('Invalid resume payload: label, fileBase64, and filename are required'));
    }

    const { label, fileBase64, filename } = parsed.data;
    const buffer = Buffer.from(fileBase64, 'base64');
    if (buffer.length === 0) {
      return next(badRequest('Uploaded file is empty'));
    }

    const resume = await createResume(req.user!.userId, label, buffer, filename);
    res.status(201).json({ resume });
  } catch (error) {
    next(error);
  }
}

export async function getResumesController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const resumes = await getResumes(req.user!.userId);
    res.json({ resumes });
  } catch (error) {
    next(error);
  }
}

export async function deleteResumeController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    await deleteResume(req.user!.userId, req.params.id);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
}

export async function getResumeStatsController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const stats = await getResumeStats(req.user!.userId, req.params.id);
    res.json(stats);
  } catch (error) {
    next(error);
  }
}
