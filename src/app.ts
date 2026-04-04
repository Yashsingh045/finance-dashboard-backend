import express, { Request, Response } from 'express';
import { prisma } from './utils/prisma';
import { setupSwagger } from './utils/swagger';
import { errorHandler } from './middleware/errorHandler';
import apiRouter from './routes/index';
import { logger } from './utils/logger';

// src/app.ts
// Express app factory — exported without calling listen() so tests can import it
// without starting a live server. server.ts calls app.listen().
export function createApp() {
  const app = express();

  // Parse JSON bodies
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Swagger UI at /api-docs (public, no auth)
  setupSwagger(app);

  // Health check — public, no auth required
  // Returns "database": "error" (still 200) if DB is unreachable
  app.get('/health', async (_req: Request, res: Response) => {
    let dbStatus = 'connected';
    try {
      await prisma.$queryRaw`SELECT 1`;
    } catch {
      dbStatus = 'error';
      logger.warn('Database health check failed');
    }
    res.status(200).json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      database: dbStatus,
    });
  });

  // Mount all API routes under /api
  app.use('/api', apiRouter);

  // Global error handler — MUST be last middleware (4 arguments)
  app.use(errorHandler);

  return app;
}

export default createApp();
