import type { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import {
  createApplication,
  deleteApplication,
  getApplications,
  updateApplication
} from './applications.service.js';
import { APPLICATION_STATUSES, type ApplicationStatus } from './applications.types.js';
import { badRequest } from '../../common/errors.js';

const statusSchema = z.enum(APPLICATION_STATUSES as [ApplicationStatus, ...ApplicationStatus[]]);

const createSchema = z.object({
  company: z.string().min(1),
  role: z.string().min(1),
  location: z.string().nullable().optional(),
  appliedDate: z.string().min(1),
  status: statusSchema.optional(),
  notes: z.string().nullable().optional()
});

const updateSchema = createSchema.partial();

const querySchema = z.object({
  status: statusSchema.optional()
});

export async function createApplicationController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const parsed = createSchema.safeParse(req.body);
    if (!parsed.success) {
      return next(badRequest('Invalid application payload'));
    }
    const application = await createApplication(req.user!.userId, parsed.data);
    res.status(201).json({ application });
  } catch (error) {
    next(error);
  }
}

export async function getApplicationsController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const parsed = querySchema.safeParse(req.query);
    if (!parsed.success) {
      return next(badRequest('Invalid status filter'));
    }
    const applications = await getApplications(req.user!.userId, parsed.data.status);
    res.json({ applications });
  } catch (error) {
    next(error);
  }
}

export async function updateApplicationController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const parsed = updateSchema.safeParse(req.body);
    if (!parsed.success) {
      return next(badRequest('Invalid application payload'));
    }
    const application = await updateApplication(req.user!.userId, req.params.id, parsed.data);
    res.json({ application });
  } catch (error) {
    next(error);
  }
}

export async function deleteApplicationController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    await deleteApplication(req.user!.userId, req.params.id);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
}
