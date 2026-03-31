import type { Request, Response, NextFunction } from 'express';
import { AppError } from '../errors/AppError';

export function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction,
): Response {
  // Operational errors (expected)
  if (err instanceof AppError) {
    const payload: Record<string, unknown> = {
      error: err.name,
      message: err.message,
    };
    if ('errors' in err) {
      payload.errors = (err as { errors: Record<string, string[]> }).errors;
    }
    return res.status(err.statusCode).json(payload);
  }

  // Unexpected errors — log and return 500
  console.error('[UNHANDLED ERROR]', err);
  return res.status(500).json({
    error: 'InternalServerError',
    message: 'An unexpected error occurred',
  });
}
