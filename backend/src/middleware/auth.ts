import type { Request, Response, NextFunction } from 'express';
import { verifyAccessToken, type TokenPayload } from '../common/jwt.js';
import { unauthorized, forbidden } from '../common/errors.js';

declare global {
  namespace Express {
    interface Request {
      user?: TokenPayload;
    }
  }
}

export function requireAuth(req: Request, _res: Response, next: NextFunction) {
  const header = req.headers.authorization;

  if (!header || !header.startsWith('Bearer ')) {
    return next(unauthorized('Missing or invalid authorization header'));
  }

  const token = header.split(' ')[1];

  try {
    req.user = verifyAccessToken(token);
    next();
  } catch {
    next(unauthorized('Invalid or expired token'));
  }
}

export function requireRole(...roles: string[]) {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(unauthorized());
    }

    if (!roles.includes(req.user.role)) {
      return next(forbidden('Insufficient permissions'));
    }

    next();
  };
}
