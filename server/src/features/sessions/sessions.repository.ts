import { prisma } from '../../config/prisma';
import { Prisma } from '@prisma/client';

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

  create(data: {
    taskId: string;
    userId: string;
    taskType: string;
    plannedMinutes?: number;
    startedAt: Date;
  }) {
    return prisma.pomodoroSession.create({
      data: {
        taskId: data.taskId,
        userId: data.userId,
        taskType: data.taskType,
        plannedMinutes: data.plannedMinutes,
        startedAt: data.startedAt,
        status: 'RUNNING',
      },
    });
  },

  reset(id: string, userId: string, actualMinutes: number) {
    return prisma.pomodoroSession.update({
      where: { id, userId, deletedAt: null },
      data: {
        status: 'RESET',
        actualMinutes,
        endedAt: new Date(),
      },
    });
  },

  complete(id: string, userId: string, plannedMinutes: number) {
    return prisma.pomodoroSession.update({
      where: { id, userId, deletedAt: null },
      data: {
        status: 'COMPLETED',
        actualMinutes: plannedMinutes,
        endedAt: new Date(),
      },
    });
  },

  softDelete(id: string, userId: string) {
    return prisma.pomodoroSession.update({
      where: { id, userId },
      data: { deletedAt: new Date() },
    }).catch((err: Error) => {
      if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2025') {
        return null;
      }
      throw err;
    });
  },
};
