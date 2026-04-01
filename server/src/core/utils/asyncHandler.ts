import type { Request, Response, NextFunction, RequestHandler } from 'express';

/**
 * Wraps an async Express route handler so that rejected promises
 * are automatically forwarded to the error-handling middleware via next().
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function asyncHandler(fn: (...args: any[]) => Promise<any>): RequestHandler {
  return (...args: Parameters<RequestHandler>): void => {
    Promise.resolve(fn(...args)).catch(args[2]);
  };
}
