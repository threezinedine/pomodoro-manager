import type { Request, Response, NextFunction } from 'express';
import { UnauthorizedError } from '../errors/AppError.js';
import { AUTH_TOKEN, SYSTEM_USER_ID } from '../../config/index.js';

export interface AuthenticatedRequest extends Request {
  userId: string;
}

export function authMiddleware(
  req: Request,
  _res: Response,
  next: NextFunction,
): void {
  const authHeader = req.headers.authorization ?? '';
  const token = authHeader.startsWith('Bearer ')
    ? authHeader.slice(7)
    : null;

  if (!token || token !== AUTH_TOKEN) {
    throw new UnauthorizedError('Invalid or missing token');
  }

  // Attach system user ID for all authenticated requests
  (req as AuthenticatedRequest).userId = SYSTEM_USER_ID;
  next();
}
