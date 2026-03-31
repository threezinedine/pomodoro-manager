import 'dotenv/config';
import express, { Application } from 'express';
import helmet from 'helmet';
import compression from 'compression';
import { PORT } from './config/index.js';
import { errorHandler } from './core/middleware/errorHandler.js';

const app: Application = express();

// Security & performance middleware
app.use(helmet());
app.use(compression());
app.use(express.json());

// Health check
app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

// Placeholder root — expanded by feature routes
app.get('/', (_req, res) => {
  res.json({ message: 'Pomodoro Manager API' });
});

// Global error handler (must be last)
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

export default app;
