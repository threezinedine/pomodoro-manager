import { prisma } from '../../config/prisma';

export const tagsRepository = {
  findAll(userId: string) {
    return prisma.taskTag.findMany({
      where: { userId, deletedAt: null },
      orderBy: { createdAt: 'asc' },
    });
  },

  create(data: { name: string; color?: string; userId: string }) {
    return prisma.taskTag.create({ data });
  },

  softDelete(id: string, userId: string) {
    return prisma.taskTag.update({
      where: { id, userId },
      data: { deletedAt: new Date() },
    });
  },
};
