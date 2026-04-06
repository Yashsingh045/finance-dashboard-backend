import express, { Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { prisma } from './utils/prisma';
import { setupSwagger } from './utils/swagger';
import { errorHandler } from './middleware/errorHandler';
import apiRouter from './routes/index';
import { logger } from './utils/logger';

// Express app factory — exported without calling listen() so tests can import it
// without starting a live server. server.ts calls app.listen().
export function createApp() {
  const app = express();

  // Basic security headers with Swagger UI exception for CSP
  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          ...helmet.contentSecurityPolicy.getDefaultDirectives(),
          'script-src': ["'self'", "'unsafe-inline'", 'cdn.jsdelivr.net'],
          'style-src': ["'self'", "'unsafe-inline'", 'cdn.jsdelivr.net', 'fonts.googleapis.com'],
          'font-src': ["'self'", 'fonts.gstatic.com'],
          'img-src': ["'self'", 'data:', 'res.cloudinary.com'],
        },
      },
    }),
  );

  // Enable CORS — in production, configure this with a whitelist of origins
  app.use(cors());

  // Parse JSON bodies
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Swagger UI at /api-docs (public, no auth)
  setupSwagger(app);

  /**
   * @swagger
   * /health:
   *   get:
   *     tags: [Utility]
   *     summary: Check system health
   *     responses:
   *       200: { description: System is healthy }
   */
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
