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
    // Check database connection
    await prisma.$queryRaw`SELECT 1`;
    
    const status = {
      timestamp: new Date().toISOString(),
      status: 'healthy',
      services: {
        database: 'connected',
        api: 'running'
      },
      uptime: process.uptime(),
      environment: process.env.NODE_ENV
    };

    // Send HTML response
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
            </div>
          </div>
        </body>
      </html>
    `;
    res.send(html);
  } catch (error) {
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
              <p>${error.message}</p>
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
