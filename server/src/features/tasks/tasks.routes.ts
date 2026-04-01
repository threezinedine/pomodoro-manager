import { Router } from 'express';
import { tasksController } from './tasks.controller';
import { authMiddleware } from '../../core/middleware/auth';

export function tasksRouter(): Router {
  const router = Router();
  router.use(authMiddleware);

  router.get('/', tasksController.list);
  router.get('/:id', tasksController.get);
  router.post('/', tasksController.create);
  router.put('/:id', tasksController.update);
  router.delete('/:id', tasksController.remove);
  router.post('/:id/cancel', tasksController.cancel);
  router.post('/:id/start', tasksController.start);
  router.post('/:id/pause', tasksController.pause);
  router.post('/:id/resume', tasksController.resume);
  router.post('/:id/tags', tasksController.addTags);
  router.delete('/:id/tags/:tagId', tasksController.removeTag);

  return router;
}
