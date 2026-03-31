import { Router } from 'express';
import { validate } from './auth.controller';

export function authRouter(): Router {
  const router = Router();

  // POST /api/auth/token — validate token, return userId
  router.post('/token', validate);

  return router;
}
