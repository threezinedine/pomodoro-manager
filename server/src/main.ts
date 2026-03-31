import 'dotenv/config';
import express, { Application } from 'express';
import helmet from 'helmet';
import compression from 'compression';
import { errorHandler } from './core/middleware/errorHandler';
import { authRouter } from './features/auth/auth.routes';

export const app: Application = express();

// Security & performance middleware
app.use(helmet());
app.use(compression());
app.use(express.json());

// Health check
app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

// API root
app.get('/', (_req, res) => {
  res.json({ message: 'Pomodoro Manager API' });
});

// Feature routes
app.use('/api/auth', authRouter());

// Global error handler (must be last)
app.use(errorHandler);
