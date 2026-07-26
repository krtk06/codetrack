import { ZodError } from 'zod';
import { AppError } from '../common/errors.js';
import type { Request, Response, NextFunction } from 'express';

export function errorHandler(err: Error, _req: Request, res: Response, _next: NextFunction) {
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      error: {
        message: err.message,
        code: err.code
      }
    });
    return;
  }

  if (err instanceof ZodError) {
    res.status(400).json({
      error: {
        message: 'Validation failed',
        code: 'VALIDATION_ERROR',
        details: err.flatten().fieldErrors
      }
    });
    return;
  }

  console.error('Unhandled error:', err);
  const isDev = process.env.NODE_ENV === 'development';

  res.status(500).json({
    error: {
      message: 'Internal server error',
      code: 'INTERNAL_ERROR',
      ...(isDev && { stack: err.stack })
    }
  });
}
