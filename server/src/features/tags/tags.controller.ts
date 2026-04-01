import type { Request, Response } from 'express';
import { tagsRepository } from './tags.repository';
import { success, created, noContent } from '../../core/utils/response';
import { asyncHandler } from '../../core/utils/asyncHandler';
import type { AuthenticatedRequest } from '../../core/middleware/auth';

export const tagsController = {
  list: asyncHandler(async (req: Request, res: Response) => {
    const { userId } = req as AuthenticatedRequest;
    return success(res, await tagsRepository.findAll(userId));
  }),

  create: asyncHandler(async (req: Request, res: Response) => {
    const { userId } = req as AuthenticatedRequest;
    const { name, color } = req.body as { name: string; color?: string };
    const tag = await tagsRepository.create({ name, color, userId });
    return created(res, tag);
  }),

  remove: asyncHandler(async (req: Request, res: Response) => {
    const { userId } = req as AuthenticatedRequest;
    await tagsRepository.softDelete(req.params.id, userId);
    return noContent(res);
  }),
};
