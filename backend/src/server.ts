import app from './app';
import { PrismaClient } from '@prisma/client';
import logger from './utils/logger';

const prisma = new PrismaClient();
const PORT = process.env.PORT || 3000;

const startServer = async () => {
  try {
    // Test database connection
    await prisma.$connect();
    logger.info('✅ Connected to database successfully');

    // Record server start time
    await prisma.serverMetrics.create({
      data: {
        cpuUsage: process.cpuUsage().user / 1000000,
        memoryUsage: process.memoryUsage().heapUsed / 1024 / 1024,
        diskUsage: 0,
        activeUsers: 0,
        totalRequests: 0
      }
    });

    // Start server
    app.listen(PORT, () => {
      logger.info(`🚀 Server running on port ${PORT}`);
    });
  } catch (error) {
    logger.error('❌ Error starting server:', error);
    process.exit(1);
  }
};

// Handle graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM signal received: closing HTTP server');
  await prisma.$disconnect();
  process.exit(0);
});

startServer();
