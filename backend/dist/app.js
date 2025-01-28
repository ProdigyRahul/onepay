"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.prisma = void 0;
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const morgan_1 = __importDefault(require("morgan"));
const compression_1 = __importDefault(require("compression"));
const client_1 = require("@prisma/client");
const userRoutes_1 = __importDefault(require("./routes/userRoutes"));
const authRoutes_1 = __importDefault(require("./routes/authRoutes"));
const walletRoutes_1 = __importDefault(require("./routes/walletRoutes"));
const kycRoutes_1 = __importDefault(require("./routes/kycRoutes"));
const onboardingRoutes_1 = __importDefault(require("./routes/onboardingRoutes"));
const express_rate_limit_1 = require("express-rate-limit");
const logger_1 = __importDefault(require("./utils/logger"));
const globalForPrisma = global;
exports.prisma = globalForPrisma.prisma || new client_1.PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
    datasources: {
        db: {
            url: process.env.DATABASE_URL
        }
    },
    __internal: {
        engine: {
            connectionLimit: 5
        }
    }
});
if (process.env.NODE_ENV !== 'production') {
    globalForPrisma.prisma = exports.prisma;
}
const app = (0, express_1.default)();
app.enable('trust proxy');
if (process.env.NODE_ENV === 'development') {
    const fs = require('fs');
    const path = require('path');
    const logsDir = path.join(__dirname, '..', 'logs');
    if (!fs.existsSync(logsDir)) {
        fs.mkdirSync(logsDir);
    }
}
const apiLimiter = (0, express_rate_limit_1.rateLimit)({
    windowMs: 15 * 60 * 1000,
    max: 100,
    standardHeaders: true,
    legacyHeaders: false,
    skip: (req) => {
        return req.path === '/health';
    }
});
app.use((0, compression_1.default)());
app.use((0, cors_1.default)());
app.use((0, helmet_1.default)());
morgan_1.default.token('request-id', (_req, _res) => Math.random().toString(36).substring(7));
app.use((0, morgan_1.default)(':request-id [:date[clf]] ":method :url HTTP/:http-version" :status :res[content-length] ":referrer" ":user-agent" - :response-time ms', {
    stream: {
        write: (message) => {
            logger_1.default.http(message.trim());
        },
    },
}));
app.use(express_1.default.json({ limit: '10mb' }));
app.use(express_1.default.urlencoded({ extended: true, limit: '10mb' }));
app.use(apiLimiter);
app.use('/api/auth', authRoutes_1.default);
app.use('/api/users', userRoutes_1.default);
app.use('/api/wallets', walletRoutes_1.default);
app.use('/api/onboarding', onboardingRoutes_1.default);
app.use('/api/kyc', kycRoutes_1.default);
app.get('/', (_req, res) => {
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
app.get('/health', async (_req, res) => {
    try {
        const startTime = Date.now();
        const MAX_HISTORY = 20;
        logger_1.default.info('[Health Check] Starting health check');
        await exports.prisma.$queryRaw `SELECT 1`;
        const dbTime = Date.now() - startTime;
        logger_1.default.info(`[Health Check] Database response time: ${dbTime}ms`);
        let serverMetrics = await exports.prisma.serverMetrics.findFirst({
            orderBy: { startTime: 'desc' }
        });
        logger_1.default.info('[Health Check] Retrieved server metrics:', {
            exists: !!serverMetrics
        });
        if (!serverMetrics) {
            logger_1.default.info('[Health Check] Creating new server metrics');
            serverMetrics = await exports.prisma.serverMetrics.create({
                data: {
                    cpuUsage: process.cpuUsage().user / 1000000,
                    memoryUsage: process.memoryUsage().heapUsed / 1024 / 1024,
                    diskUsage: 0,
                    activeUsers: 0,
                    totalRequests: 0
                }
            });
        }
        logger_1.default.info('[Health Check] Adding new historical metric');
        await exports.prisma.historicalMetric.create({
            data: {
                apiResponseTime: Date.now() - startTime,
                dbQueryTime: dbTime,
                cpuUsage: process.cpuUsage().user / 1000000,
                memoryUsage: process.memoryUsage().heapUsed / 1024 / 1024,
                requestCount: 1
            }
        });
        logger_1.default.info('[Health Check] Fetching metrics');
        const historicalMetrics = await exports.prisma.historicalMetric.findMany({
            orderBy: {
                timestamp: 'desc'
            },
            take: MAX_HISTORY
        });
        logger_1.default.info('[Health Check] Retrieved historical metrics:', {
            count: historicalMetrics.length,
            timeRange: historicalMetrics.length > 0 ? {
                first: historicalMetrics[historicalMetrics.length - 1].timestamp,
                last: historicalMetrics[0].timestamp
            } : null
        });
        const uptime = Math.floor((Date.now() - serverMetrics.startTime.getTime()) / 1000);
        const averageApiTime = historicalMetrics.reduce((acc, m) => acc + m.apiResponseTime, 0) / historicalMetrics.length;
        const averageDbTime = historicalMetrics.reduce((acc, m) => acc + m.dbQueryTime, 0) / historicalMetrics.length;
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
    }
    catch (error) {
        logger_1.default.error('[Health Check] Error:', error);
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
app.use((err, _req, res, _next) => {
    logger_1.default.error('Unhandled Error:', err);
    res.status(500).json({
        status: 'error',
        error: 'Internal server error',
    });
});
process.on('uncaughtException', (error) => {
    logger_1.default.error('Uncaught Exception:', error);
    process.exit(1);
});
process.on('unhandledRejection', (reason) => {
    logger_1.default.error('Unhandled Rejection:', reason);
    process.exit(1);
});
process.on('beforeExit', async () => {
    await exports.prisma.$disconnect();
});
exports.default = app;
//# sourceMappingURL=app.js.map