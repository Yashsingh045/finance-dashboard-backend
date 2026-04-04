import app from './app';
import { prisma } from './utils/prisma';
import { logger } from './utils/logger';

// src/server.ts
// Entry point — calls app.listen() and wires SIGTERM/SIGINT handlers
// to gracefully shut down Prisma connections before exit.

const PORT = parseInt(process.env.PORT ?? '3000', 10);

const server = app.listen(PORT, () => {
  logger.info(`🚀 Finance Dashboard API running on port ${PORT}`, {
    port: PORT,
    env: process.env.NODE_ENV ?? 'development',
    docs: `http://localhost:${PORT}/api-docs`,
    health: `http://localhost:${PORT}/health`,
  });
});

// Graceful shutdown — always call $disconnect() so DB connections are released
const shutdown = async (signal: string) => {
  logger.info(`${signal} received — shutting down gracefully`);
  server.close(async () => {
    await prisma.$disconnect();
    logger.info('Database connection closed. Server stopped.');
    process.exit(0);
  });
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

export default server;
