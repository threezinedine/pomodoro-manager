import type { Request, Response } from 'express';
import { sessionsService } from './sessions.service';
import { success, noContent } from '../../core/utils/response';
import { asyncHandler } from '../../core/utils/asyncHandler';
import type { AuthenticatedRequest } from '../../core/middleware/auth';

export const sessionsController = {
  list: asyncHandler(async (req: Request, res: Response) => {
    const { userId } = req as AuthenticatedRequest;
    const { from, to, taskId } = req.query as Record<string, string | undefined>;
    const sessions = await sessionsService.list(userId, { from, to, taskId });
    return success(res, sessions);
  }),

  remove: asyncHandler(async (req: Request, res: Response) => {
    const { userId } = req as AuthenticatedRequest;
    await sessionsService.delete(req.params.id, userId);
    return noContent(res);
  }),
};
