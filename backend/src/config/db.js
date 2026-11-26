import { PrismaClient } from '@prisma/client';

// Safety Guard: Block any non-local or live Railway database in development mode
const dbUrl = (process.env.DATABASE_URL || '').toLowerCase();
const liveKeywords = ['railway', 'rlwy.net', 'proxy.rlwy'];
const isExplicitLive = liveKeywords.some((k) => dbUrl.includes(k));
const isLocalhost = dbUrl.includes('localhost') || dbUrl.includes('127.0.0.1');

if ((isExplicitLive || !isLocalhost) && process.env.NODE_ENV === 'development') {
  console.error('\n=============================================================');
  console.error('🚨 CRITICAL SAFETY GUARD: Live DB detected, blocked in local mode');
  console.error(`DATABASE_URL is not pointed to 127.0.0.1 or localhost.`);
  console.error('Server process terminated immediately to prevent any live data changes.');
  console.error('=============================================================\n');
  process.exit(1);
}

const prismaClientSingleton = () => {
  return new PrismaClient({
    log: process.env.DEBUG_PRISMA === 'true' ? ['query', 'error', 'warn'] : ['error', 'warn'],
  });
};

const globalForPrisma = globalThis;

export const prisma = globalForPrisma.prisma ?? prismaClientSingleton();

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

export default prisma;
