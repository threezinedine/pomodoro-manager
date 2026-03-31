import type { Response } from 'express';

interface SuccessPayload<T = unknown> {
  data?: T;
  message?: string;
}

export function success<T>(
  res: Response,
  data: T,
  statusCode = 200,
): Response {
  return res.status(statusCode).json({ data });
}

export function created<T>(res: Response, data: T): Response {
  return success(res, data, 201);
}

export function noContent(res: Response): Response {
  return res.status(204).send();
}

interface ErrorPayload {
  error: string;
  message: string;
  errors?: Record<string, string[]>;
}

export function error(
  res: Response,
  statusCode: number,
  message: string,
  errors?: Record<string, string[]>,
): Response {
  const payload: ErrorPayload = { error: 'error', message };
  if (errors) payload.errors = errors;
  return res.status(statusCode).json(payload);
}
