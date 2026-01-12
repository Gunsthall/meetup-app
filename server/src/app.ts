import express from 'express';
import cors from 'cors';
import sessionsRouter from './routes/sessions.js';
import healthRouter from './routes/health.js';
import analyticsRouter from './routes/analytics.js';
import { requireApiKey } from './middleware/apiKeyAuth.js';

const app = express();

// Middleware
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  credentials: true,
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`);
  next();
});

// Routes
app.use('/v1/health', healthRouter); // Public - no auth required
app.use('/v1/sessions', requireApiKey(), sessionsRouter); // Requires API key
app.use('/v1/analytics', requireApiKey(['admin']), analyticsRouter); // Admin only

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});

// Error handler
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

export default app;
