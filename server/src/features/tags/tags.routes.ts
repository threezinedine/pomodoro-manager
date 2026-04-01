import { Router } from 'express';
import { tagsController } from './tags.controller';
import { authMiddleware } from '../../core/middleware/auth';

export function tagsRouter(): Router {
  const router = Router();
  router.use(authMiddleware);
  router.get('/', tagsController.list);
  router.post('/', tagsController.create);
  router.delete('/:id', tagsController.remove);
  return router;
}
