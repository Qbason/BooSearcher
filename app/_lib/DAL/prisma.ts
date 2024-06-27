import { isDebugMode } from '@lib/tools/logger';
import { PrismaClient } from '@prisma/client';

declare global {
  // eslint-disable-next-line no-var -- because it's a global declaration of prismaGlobal
  var prismaGlobal: undefined | PrismaClient;
}

const prisma: PrismaClient =
  globalThis.prismaGlobal ??
  new PrismaClient({
    log: isDebugMode() ? ['query', 'info', 'warn', 'error'] : undefined,
  });

if (process.env.ENVIRONMENT_NAME) globalThis.prismaGlobal = prisma;

export { prisma };
