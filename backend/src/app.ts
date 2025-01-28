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
import path from 'path';

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
app.use(process.env.NODE_ENV === 'development' 
  ? morgan('dev') 
  : morgan('combined', {
      skip: (_req, _res) => _res.statusCode < 400 // Only log errors in production
    }));
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
    
    console.log('[Health Check] Starting health check');
    
    // Check database connection and measure query time
    await prisma.$queryRaw`SELECT 1`;
    const dbTime = Date.now() - startTime;
    console.log('[Health Check] Database response time:', dbTime, 'ms');

    // Get or create server metrics
    let serverMetrics = await prisma.serverMetrics.findFirst({
      orderBy: { startTime: 'desc' }
    });

    console.log('[Health Check] Retrieved server metrics:', {
      exists: !!serverMetrics
    });

    if (!serverMetrics) {
      console.log('[Health Check] Creating new server metrics');
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
    console.log('[Health Check] Adding new historical metric');
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
    console.log('[Health Check] Fetching metrics');
    const historicalMetrics = await prisma.historicalMetric.findMany({
      orderBy: {
        timestamp: 'desc'
      },
      take: MAX_HISTORY
    });

    console.log('[Health Check] Retrieved historical metrics:', {
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
      startedAt: serverMetrics.startTime.toISOString(),
      environment: process.env.NODE_ENV
    };

    console.log('[Health Check] Rendering template with data:', {
      metricsCount: historicalMetrics.length,
      statusSnapshot: status
    });

    res.render('health', { status, metrics: historicalMetrics });
  } catch (error) {
    console.error('[Health Check] Error:', error);
    res.status(500).render('health', {
      status: {
        timestamp: new Date().toISOString(),
        status: 'error',
        services: {
          database: 'error',
          api: 'error'
        },
        performance: {
          currentDbResponse: 'N/A',
          currentApiResponse: 'N/A',
          averageDbTime: 'N/A',
          averageApiTime: 'N/A'
        },
        uptime: 0,
        startedAt: new Date().toISOString(),
        environment: process.env.NODE_ENV
      },
      metrics: []
    });
  }
});

// Error handling middleware
app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    error: 'Internal server error',
  });
});

// Cleanup function for Prisma on server shutdown
process.on('beforeExit', async () => {
  await prisma.$disconnect();
});

export default app;
