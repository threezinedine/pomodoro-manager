import { prisma } from '../../config/prisma';
import { Prisma } from '@prisma/client';
import type { Task } from '@prisma/client';

export interface TaskCreateInput {
  title: string;
  taskType: string;
  userId: string;
  date: Date;
  taskTemplateId?: string;
  tagIds?: string[];
  taskStatus?: string;
}

export interface TaskUpdateInput {
  title?: string;
  taskType?: string;
  taskStatus?: string;
  date?: Date;
}

const TASK_INCLUDE = {
  tags: {
    include: { tag: true },
  },
};

export const tasksRepository = {
  findByDate(userId: string, date: Date) {
    const start = new Date(date);
    start.setHours(0, 0, 0, 0);
    const end = new Date(date);
    end.setHours(23, 59, 59, 999);

    return prisma.task.findMany({
      where: { userId, date: { gte: start, lte: end }, deletedAt: null },
      include: TASK_INCLUDE,
      orderBy: { createdAt: 'asc' },
    });
  },

  findById(id: string, userId: string) {
    return prisma.task.findFirst({
      where: { id, userId, deletedAt: null },
      include: TASK_INCLUDE,
    });
  },

  create(data: TaskCreateInput): Promise<Task> {
    const { tagIds, ...rest } = data;
    return prisma.task.create({
      data: {
        ...rest,
        tags: tagIds
          ? { create: tagIds.map((tagId) => ({ tag: { connect: { id: tagId } } })) }
          : undefined,
      },
      include: TASK_INCLUDE,
    });
  },

  update(id: string, userId: string, data: TaskUpdateInput) {
    return prisma.task.update({
      where: { id },
      data,
      include: TASK_INCLUDE,
    });
  },

  softDelete(id: string, userId: string) {
    return prisma.task.update({
      where: { id, userId },
      data: { deletedAt: new Date() },
    });
  },

  cancel(id: string, userId: string) {
    return prisma.task.update({
      where: { id, userId, deletedAt: null },
      data: { taskStatus: 'CANCELLED' },
      include: TASK_INCLUDE,
    });
  },

  addTags(id: string, tagIds: string[]) {
    const validIds = tagIds.filter(Boolean);
    return Promise.all(
      validIds.map((tagId) =>
        prisma.taskTagOnTask.upsert({
          where: { taskId_tagId: { taskId: id, tagId } },
          update: {},
          create: { taskId: id, tagId },
        })
      )
    );
  },

  removeTag(id: string, tagId: string) {
    return prisma.taskTagOnTask.delete({
      where: { taskId_tagId: { taskId: id, tagId } },
    }).catch((err: Error) => {
      // Tolerate if the tag was already removed
      if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2025') {
        return null;
      }
      throw err;
    });
  },
};
