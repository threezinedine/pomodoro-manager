import type { Request, Response } from 'express';
import { validateToken } from './auth.service';
import { success } from '../../core/utils/response';
import { UnauthorizedError } from '../../core/errors/AppError';
import { SYSTEM_USER_ID } from '../../config/index';

export function validate(
  req: Request,
  res: Response,
): Response {
  const authHeader = req.headers.authorization ?? '';
  const token = authHeader.startsWith('Bearer ')
    ? authHeader.slice(7)
    : '';

  const result = validateToken(token);

  if (!result.valid) {
    throw new UnauthorizedError('Invalid token');
  }

  return success(res, { userId: SYSTEM_USER_ID, valid: true });
}
