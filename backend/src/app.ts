import express, { Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import { PrismaClient } from '@prisma/client';
import userRoutes from './routes/userRoutes';
import authRoutes from './routes/authRoutes';
import walletRoutes from './routes/walletRoutes';
import kycRoutes from './routes/kycRoutes';
import onboardingRoutes from './routes/onboardingRoutes';
import { rateLimit } from 'express-rate-limit';
import logger from './utils/logger';

// Initialize Prisma Client with connection pooling and optimization
const globalForPrisma = global as { prisma?: PrismaClient };

export const prisma = globalForPrisma.prisma || new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  datasources: {
    db: {
      url: process.env.DATABASE_URL
    }
  },
  // @ts-ignore - Prisma doesn't expose these types but they work
  __internal: {
    engine: {
      connectionLimit: 5 // Adjust based on your needs
    }
  }
});

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

// Create Express app
const app = express();

// Trust proxy configuration for Vercel
app.enable('trust proxy');

// Create logs directory if in development
if (process.env.NODE_ENV === 'development') {
  const fs = require('fs');
  const path = require('path');
  const logsDir = path.join(__dirname, '..', 'logs');
  if (!fs.existsSync(logsDir)) {
    fs.mkdirSync(logsDir);
  }
}

// Optimized rate limiting configuration
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  // Add Redis store here if needed for distributed rate limiting
  skip: (req) => {
    // Skip rate limiting for health checks
    return req.path === '/health';
  }
});

// Middleware
app.use(compression()); // Add compression early in middleware chain
app.use(cors());
app.use(helmet());

// Custom morgan format that uses our logger
morgan.token('request-id', (_req, _res) => Math.random().toString(36).substring(7));
app.use(morgan(
  ':request-id [:date[clf]] ":method :url HTTP/:http-version" :status :res[content-length] ":referrer" ":user-agent" - :response-time ms',
  {
    stream: {
      write: (message: string) => {
        logger.http(message.trim());
      },
    },
  }
));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Apply rate limiting to all routes except health check
app.use(apiLimiter);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/wallets', walletRoutes);
app.use('/api/onboarding', onboardingRoutes);
app.use('/api/kyc', kycRoutes);

// Root route with welcome message
app.get('/', (_req: Request, res: Response) => {
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>OnePay API</title>
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
            background: #2563EB;
            color: white;
            height: 100vh;
            margin: 0;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            text-align: center;
            padding: 0 20px;
          }
          h1 {
            font-size: 2.5rem;
            margin-bottom: 1rem;
          }
          p {
            font-size: 1.2rem;
            opacity: 0.9;
            max-width: 600px;
            line-height: 1.6;
          }
          .status {
            background: rgba(255,255,255,0.1);
            padding: 0.5rem 1rem;
            border-radius: 20px;
            margin-top: 1rem;
          }
        </style>
      </head>
      <body>
        <h1>🚀 OnePay API</h1>
        <p>Welcome to the OnePay API server. This is the backend service that powers the OnePay mobile application.</p>
        <div class="status">Server is running</div>
      </body>
    </html>
  `;
  res.send(html);
});

// Health check route
app.get('/health', async (_req: Request, res: Response) => {
  try {
    const startTime = Date.now();
    const MAX_HISTORY = 20; // Keep last 20 metrics
    
    logger.info('[Health Check] Starting health check');
    
    // Check database connection and measure query time
    await prisma.$queryRaw`SELECT 1`;
    const dbTime = Date.now() - startTime;
    logger.info(`[Health Check] Database response time: ${dbTime}ms`);

    // Get or create server metrics
    let serverMetrics = await prisma.serverMetrics.findFirst({
      orderBy: { startTime: 'desc' }
    });

    logger.info('[Health Check] Retrieved server metrics:', {
      exists: !!serverMetrics
    });

    if (!serverMetrics) {
      logger.info('[Health Check] Creating new server metrics');
      serverMetrics = await prisma.serverMetrics.create({
        data: {
          cpuUsage: process.cpuUsage().user / 1000000,
          memoryUsage: process.memoryUsage().heapUsed / 1024 / 1024,
          diskUsage: 0, // You might want to implement actual disk usage check
          activeUsers: 0,
          totalRequests: 0
        }
      });
    }

    // Add new historical metric
    logger.info('[Health Check] Adding new historical metric');
    await prisma.historicalMetric.create({
      data: {
        apiResponseTime: Date.now() - startTime,
        dbQueryTime: dbTime,
        cpuUsage: process.cpuUsage().user / 1000000,
        memoryUsage: process.memoryUsage().heapUsed / 1024 / 1024,
        requestCount: 1
      }
    });

    // Get historical metrics for statistics
    logger.info('[Health Check] Fetching metrics');
    const historicalMetrics = await prisma.historicalMetric.findMany({
      orderBy: {
        timestamp: 'desc'
      },
      take: MAX_HISTORY
    });

    logger.info('[Health Check] Retrieved historical metrics:', {
      count: historicalMetrics.length,
      timeRange: historicalMetrics.length > 0 ? {
        first: historicalMetrics[historicalMetrics.length - 1].timestamp,
        last: historicalMetrics[0].timestamp
      } : null
    });

    const uptime = Math.floor((Date.now() - serverMetrics.startTime.getTime()) / 1000);
    const averageApiTime = historicalMetrics.reduce((acc: number, m) => acc + m.apiResponseTime, 0) / historicalMetrics.length;
    const averageDbTime = historicalMetrics.reduce((acc: number, m) => acc + m.dbQueryTime, 0) / historicalMetrics.length;

    const status = {
      timestamp: new Date().toISOString(),
      status: 'healthy',
      services: {
        database: 'connected',
        api: 'running'
      },
      performance: {
        currentDbResponse: `${dbTime}ms`,
        currentApiResponse: `${Date.now() - startTime}ms`,
        averageDbTime: `${Math.round(averageDbTime)}ms`,
        averageApiTime: `${Math.round(averageApiTime)}ms`
      },
      uptime,
      environment: process.env.NODE_ENV
    };

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>OnePay Health Status</title>
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
              background: #2563EB;
              color: white;
              min-height: 100vh;
              margin: 0;
              padding: 20px;
            }
            .container {
              max-width: 800px;
              margin: 0 auto;
            }
            h1 {
              font-size: 2rem;
              margin-bottom: 2rem;
            }
            .status-card {
              background: rgba(255,255,255,0.1);
              border-radius: 10px;
              padding: 20px;
              margin-bottom: 20px;
            }
            .service {
              display: flex;
              justify-content: space-between;
              padding: 10px 0;
              border-bottom: 1px solid rgba(255,255,255,0.1);
            }
            .service:last-child {
              border-bottom: none;
            }
            .status-badge {
              background: #10B981;
              padding: 4px 12px;
              border-radius: 20px;
              font-size: 0.9rem;
            }
            .error {
              background: #EF4444;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>🏥 System Health Status</h1>
            <div class="status-card">
              <div class="service">
                <strong>Status</strong>
                <span class="status-badge">${status.status}</span>
              </div>
              <div class="service">
                <strong>Database</strong>
                <span class="status-badge">${status.services.database}</span>
              </div>
              <div class="service">
                <strong>API Server</strong>
                <span class="status-badge">${status.services.api}</span>
              </div>
              <div class="service">
                <strong>Environment</strong>
                <span>${status.environment}</span>
              </div>
              <div class="service">
                <strong>Uptime</strong>
                <span>${Math.floor(status.uptime)} seconds</span>
              </div>
              <div class="service">
                <strong>Last Checked</strong>
                <span>${new Date(status.timestamp).toLocaleString()}</span>
              </div>
              <div class="service">
                <strong>Current DB Response</strong>
                <span>${status.performance.currentDbResponse}</span>
              </div>
              <div class="service">
                <strong>Average DB Response</strong>
                <span>${status.performance.averageDbTime}</span>
              </div>
              <div class="service">
                <strong>Current API Response</strong>
                <span>${status.performance.currentApiResponse}</span>
              </div>
              <div class="service">
                <strong>Average API Response</strong>
                <span>${status.performance.averageApiTime}</span>
              </div>
            </div>
          </div>
        </body>
      </html>
    `;
    res.send(html);
  } catch (error) {
    logger.error('[Health Check] Error:', error);
    const errorHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>OnePay Health Status - Error</title>
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
              background: #EF4444;
              color: white;
              min-height: 100vh;
              margin: 0;
              padding: 20px;
            }
            .container {
              max-width: 800px;
              margin: 0 auto;
            }
            h1 {
              font-size: 2rem;
              margin-bottom: 2rem;
            }
            .error-card {
              background: rgba(0,0,0,0.1);
              border-radius: 10px;
              padding: 20px;
              margin-bottom: 20px;
            }
            .timestamp {
              opacity: 0.8;
              margin-top: 20px;
              font-size: 0.9rem;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>⚠️ System Health Alert</h1>
            <div class="error-card">
              <h2>Service Disruption Detected</h2>
              <p>${error instanceof Error ? error.message : 'Unknown error occurred'}</p>
              <div class="timestamp">
                Detected at: ${new Date().toLocaleString()}
              </div>
            </div>
          </div>
        </body>
      </html>
    `;
    res.status(500).send(errorHtml);
  }
});

// Error handling middleware
app.use((err: Error, _req: Request, res: Response, _next: Function) => {
  logger.error('Unhandled Error:', err);
  res.status(500).json({
    status: 'error',
    error: 'Internal server error',
  });
});

process.on('uncaughtException', (error: Error) => {
  logger.error('Uncaught Exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason: any) => {
  logger.error('Unhandled Rejection:', reason);
  process.exit(1);
});

process.on('beforeExit', async () => {
  await prisma.$disconnect();
});

export default app;
