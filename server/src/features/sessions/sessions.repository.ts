import { prisma } from '../../config/prisma';

export const sessionsRepository = {
  findByDateRange(userId: string, from: Date, to: Date) {
    return prisma.pomodoroSession.findMany({
      where: {
        userId,
        startedAt: { gte: from, lte: to },
        deletedAt: null,
      },
      include: {
        task: {
          include: {
            tags: {
              include: { tag: true },
            },
          },
        },
      },
      orderBy: { startedAt: 'asc' },
    });
  },

  findByTaskId(taskId: string, userId: string) {
    return prisma.pomodoroSession.findMany({
      where: { taskId, userId, deletedAt: null },
      orderBy: { startedAt: 'asc' },
    });
  },

  findById(id: string, userId: string) {
    return prisma.pomodoroSession.findFirst({
      where: { id, userId, deletedAt: null },
      include: {
        task: {
          include: {
            tags: {
              include: { tag: true },
            },
          },
        },
      },
    });
  },

  softDelete(id: string, userId: string) {
    return prisma.pomodoroSession.update({
      where: { id, userId },
      data: { deletedAt: new Date() },
    }).catch(() => null);
  },
};
