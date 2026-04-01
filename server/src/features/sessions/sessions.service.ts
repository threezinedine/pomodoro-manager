import { sessionsRepository } from './sessions.repository';
import { NotFoundError } from '../../core/errors/AppError';

export const sessionsService = {
  async list(userId: string, filters: {
    from?: string;
    to?: string;
    taskId?: string;
  }) {
    if (filters.taskId) {
      return sessionsRepository.findByTaskId(filters.taskId, userId);
    }

    if (filters.from && filters.to) {
      const from = new Date(filters.from);
      const to = new Date(filters.to);
      to.setHours(23, 59, 59, 999);
      return sessionsRepository.findByDateRange(userId, from, to);
    }

    // Default: today's sessions
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const end = new Date();
    end.setHours(23, 59, 59, 999);
    return sessionsRepository.findByDateRange(userId, today, end);
  },

  async getById(id: string, userId: string) {
    const session = await sessionsRepository.findById(id, userId);
    if (!session) throw new NotFoundError('Session not found');
    return session;
  },

  async create(userId: string, data: {
    taskId: string;
    taskType: string;
    plannedMinutes?: number;
    startedAt?: Date;
  }) {
    return sessionsRepository.create({
      taskId: data.taskId,
      userId,
      taskType: data.taskType,
      plannedMinutes: data.plannedMinutes,
      startedAt: data.startedAt ?? new Date(),
    });
  },

  async reset(id: string, userId: string, actualMinutes: number) {
    const existing = await sessionsRepository.findById(id, userId);
    if (!existing) throw new NotFoundError('Session not found');
    return sessionsRepository.reset(id, userId, actualMinutes);
  },

  async complete(id: string, userId: string, plannedMinutes: number) {
    const existing = await sessionsRepository.findById(id, userId);
    if (!existing) throw new NotFoundError('Session not found');
    return sessionsRepository.complete(id, userId, plannedMinutes);
  },

  async delete(id: string, userId: string) {
    const existing = await sessionsRepository.findById(id, userId);
    if (!existing) throw new NotFoundError('Session not found');
    return sessionsRepository.softDelete(id, userId);
  },
};
