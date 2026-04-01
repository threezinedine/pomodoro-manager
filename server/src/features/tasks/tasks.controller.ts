import type { Request, Response } from 'express';
import { tasksService } from './tasks.service';
import { success, created, noContent } from '../../core/utils/response';
import { asyncHandler } from '../../core/utils/asyncHandler';
import { ValidationError } from '../../core/errors/AppError';
import type { AuthenticatedRequest } from '../../core/middleware/auth';

function parseDate(dateStr: string): Date {
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) throw new ValidationError('Invalid date format');
  return d;
}

export const tasksController = {
  list: asyncHandler(async (req: Request, res: Response) => {
    const { userId } = req as AuthenticatedRequest;
    const dateStr = req.query.date as string;
    if (!dateStr) throw new ValidationError('date query parameter is required');
    const tasks = await tasksService.listByDate(userId, parseDate(dateStr));
    return success(res, tasks);
  }),

  get: asyncHandler(async (req: Request, res: Response) => {
    const { userId } = req as AuthenticatedRequest;
    const task = await tasksService.getById(req.params.id, userId);
    return success(res, task);
  }),

  create: asyncHandler(async (req: Request, res: Response) => {
    const { userId } = req as AuthenticatedRequest;
    const { title, taskType, date, taskTemplateId, tagIds } = req.body;
    if (!title) throw new ValidationError('title is required');
    if (!taskType) throw new ValidationError('taskType is required');
    if (!date) throw new ValidationError('date is required');
    const task = await tasksService.create(userId, {
      title, taskType, date, taskTemplateId, tagIds,
    });
    return created(res, task);
  }),

  update: asyncHandler(async (req: Request, res: Response) => {
    const { userId } = req as AuthenticatedRequest;
    const { title, taskType, taskStatus, date } = req.body;
    const task = await tasksService.update(req.params.id, userId, {
      title, taskType, taskStatus, date,
    });
    return success(res, task);
  }),

  remove: asyncHandler(async (req: Request, res: Response) => {
    const { userId } = req as AuthenticatedRequest;
    await tasksService.delete(req.params.id, userId);
    return noContent(res);
  }),

  cancel: asyncHandler(async (req: Request, res: Response) => {
    const { userId } = req as AuthenticatedRequest;
    const task = await tasksService.cancel(req.params.id, userId);
    return success(res, task);
  }),

  addTags: asyncHandler(async (req: Request, res: Response) => {
    const { userId } = req as AuthenticatedRequest;
    const { tagIds } = req.body as { tagIds: string[] };
    const task = await tasksService.addTags(req.params.id, userId, tagIds);
    return success(res, task);
  }),

  removeTag: asyncHandler(async (req: Request, res: Response) => {
    const { userId } = req as AuthenticatedRequest;
    const task = await tasksService.removeTag(req.params.id, userId, req.params.tagId);
    return success(res, task);
  }),

  start: asyncHandler(async (req: Request, res: Response) => {
    const { userId } = req as AuthenticatedRequest;
    const { plannedMinutes } = req.body as { plannedMinutes?: number };
    const result = await tasksService.start(req.params.id, userId, plannedMinutes);
    return created(res, result);
  }),

  pause: asyncHandler(async (req: Request, res: Response) => {
    const { userId } = req as AuthenticatedRequest;
    const { actualMinutes } = req.body as { actualMinutes?: number };
    const result = await tasksService.pause(req.params.id, userId, actualMinutes ?? 0);
    return success(res, result);
  }),

  resume: asyncHandler(async (req: Request, res: Response) => {
    const { userId } = req as AuthenticatedRequest;
    const { plannedMinutes } = req.body as { plannedMinutes?: number };
    const result = await tasksService.resume(req.params.id, userId, plannedMinutes);
    return created(res, result);
  }),
};
