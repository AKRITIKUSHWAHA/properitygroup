import app from './app.js';
import { env } from './config/env.js';
import { prisma } from './config/db.js';
import { logger } from './utils/logger.js';

const PORT = env.PORT || 5000;

async function bootstrap() {
  try {
    // Verify database connectivity
    await prisma.$connect();
    logger.success('Connected successfully to MySQL database (njs_db) via Prisma ORM.');

    const server = app.listen(PORT, () => {
      logger.success(`NJS Property Group API server running in ${env.NODE_ENV} mode on port ${PORT}`);
      logger.info(`Health check endpoint: http://localhost:${PORT}/api/v1/health`);
    });

    // Graceful Shutdown Handlers
    const shutdown = async (signal) => {
      logger.info(`${signal} signal received. Closing HTTP server and database pool...`);
      server.close(async () => {
        await prisma.$disconnect();
        logger.info('Database pool closed. Exiting process.');
        process.exit(0);
      });
    };

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));
  } catch (error) {
    logger.error('Failed to initialize server or connect to MySQL database:', error);
    process.exit(1);
  }
}

bootstrap();

