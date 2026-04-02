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

  async delete(id: string, userId: string) {
    const existing = await sessionsRepository.findById(id, userId);
    if (!existing) throw new NotFoundError('Session not found');
    return sessionsRepository.softDelete(id, userId);
  },
};
