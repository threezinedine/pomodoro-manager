import { tasksRepository } from './tasks.repository';
import { NotFoundError } from '../../core/errors/AppError';

export const tasksService = {
  async listByDate(userId: string, date: Date) {
    return tasksRepository.findByDate(userId, date);
  },

  async getById(id: string, userId: string) {
    const task = await tasksRepository.findById(id, userId);
    if (!task) throw new NotFoundError('Task not found');
    return task;
  },

  async create(userId: string, data: {
    title: string;
    taskType: string;
    date: string;
    taskTemplateId?: string;
    tagIds?: string[];
  }) {
    const dateObj = new Date(data.date);
    return tasksRepository.create({
      title: data.title,
      taskType: data.taskType,
      userId,
      date: dateObj,
      taskTemplateId: data.taskTemplateId,
      tagIds: data.tagIds,
      taskStatus: 'PENDING',
    });
  },

  async update(id: string, userId: string, data: {
    title?: string;
    taskType?: string;
    taskStatus?: string;
    date?: string;
  }) {
    const existing = await tasksRepository.findById(id, userId);
    if (!existing) throw new NotFoundError('Task not found');

    return tasksRepository.update(id, userId, {
      title: data.title,
      taskType: data.taskType,
      taskStatus: data.taskStatus,
      date: data.date ? new Date(data.date) : undefined,
    });
  },

  async delete(id: string, userId: string) {
    const existing = await tasksRepository.findById(id, userId);
    if (!existing) throw new NotFoundError('Task not found');
    return tasksRepository.softDelete(id, userId);
  },

  async cancel(id: string, userId: string) {
    const existing = await tasksRepository.findById(id, userId);
    if (!existing) throw new NotFoundError('Task not found');
    return tasksRepository.cancel(id, userId);
  },

  async addTags(id: string, userId: string, tagIds: string[]) {
    const existing = await tasksRepository.findById(id, userId);
    if (!existing) throw new NotFoundError('Task not found');
    await tasksRepository.addTags(id, tagIds);
    return tasksRepository.findById(id, userId);
  },

  async removeTag(id: string, userId: string, tagId: string) {
    const existing = await tasksRepository.findById(id, userId);
    if (!existing) throw new NotFoundError('Task not found');
    await tasksRepository.removeTag(id, tagId);
    return tasksRepository.findById(id, userId);
  },
};
