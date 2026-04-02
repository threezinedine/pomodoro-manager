import { Router } from 'express';
import { sessionsController } from './sessions.controller';
import { authMiddleware } from '../../core/middleware/auth';

export function sessionsRouter(): Router {
  const router = Router();
  router.use(authMiddleware);

  router.get('/', sessionsController.list);
  router.delete('/:id', sessionsController.remove);

  return router;
}
