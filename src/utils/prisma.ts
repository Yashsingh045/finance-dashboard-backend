import { PrismaClient } from '@prisma/client';

// Singleton Prisma client — prevents exhausting the connection pool during dev
// hot-reloads and in test environments that import the module multiple times.
const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}
