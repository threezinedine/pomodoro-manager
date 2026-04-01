import type { Request, Response } from 'express';
import { sessionsService } from './sessions.service';
import { success, created, noContent } from '../../core/utils/response';
import { asyncHandler } from '../../core/utils/asyncHandler';
import { ValidationError } from '../../core/errors/AppError';
import type { AuthenticatedRequest } from '../../core/middleware/auth';

export const sessionsController = {
  list: asyncHandler(async (req: Request, res: Response) => {
    const { userId } = req as AuthenticatedRequest;
    const { from, to, taskId } = req.query as Record<string, string | undefined>;
    const sessions = await sessionsService.list(userId, { from, to, taskId });
    return success(res, sessions);
  }),

  create: asyncHandler(async (req: Request, res: Response) => {
    const { userId } = req as AuthenticatedRequest;
    const { taskId, taskType, plannedMinutes } = req.body as {
      taskId: string;
      taskType: string;
      plannedMinutes?: number;
    };
    if (!taskId) throw new ValidationError('taskId is required');
    if (!taskType) throw new ValidationError('taskType is required');
    if (taskType !== 'POMODORO') {
      throw new ValidationError('Sessions can only be started for POMODORO tasks');
    }
    const session = await sessionsService.create(userId, {
      taskId,
      taskType,
      plannedMinutes,
    });
    return created(res, session);
  }),

  reset: asyncHandler(async (req: Request, res: Response) => {
    const { userId } = req as AuthenticatedRequest;
    const { actualMinutes } = req.body as { actualMinutes?: number };
    const session = await sessionsService.reset(req.params.id, userId, actualMinutes ?? 0);
    return success(res, session);
  }),

  complete: asyncHandler(async (req: Request, res: Response) => {
    const { userId } = req as AuthenticatedRequest;
    const { plannedMinutes } = req.body as { plannedMinutes?: number };
    const session = await sessionsService.complete(req.params.id, userId, plannedMinutes ?? 25);
    return success(res, session);
  }),

  remove: asyncHandler(async (req: Request, res: Response) => {
    const { userId } = req as AuthenticatedRequest;
    await sessionsService.delete(req.params.id, userId);
    return noContent(res);
  }),
};
