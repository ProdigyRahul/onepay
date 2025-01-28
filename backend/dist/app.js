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
const client_1 = require("@prisma/client");
const userRoutes_1 = __importDefault(require("./routes/userRoutes"));
const authRoutes_1 = __importDefault(require("./routes/authRoutes"));
const walletRoutes_1 = __importDefault(require("./routes/walletRoutes"));
const kycRoutes_1 = __importDefault(require("./routes/kycRoutes"));
const rateLimiter_1 = require("./middleware/rateLimiter");
const onboardingRoutes_1 = __importDefault(require("./routes/onboardingRoutes"));
const express_rate_limit_1 = require("express-rate-limit");
const path_1 = __importDefault(require("path"));
exports.prisma = new client_1.PrismaClient();
const app = (0, express_1.default)();
app.use((0, cors_1.default)());
app.use((0, helmet_1.default)());
app.use((0, morgan_1.default)('dev'));
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
app.use(rateLimiter_1.apiLimiter);
const limiter = (0, express_rate_limit_1.rateLimit)({
    windowMs: 15 * 60 * 1000,
    max: 100
});
app.use(limiter);
app.set('view engine', 'ejs');
app.set('views', path_1.default.join(__dirname, 'views'));
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
        console.log('[Health Check] Starting health check');
        await exports.prisma.$queryRaw `SELECT 1`;
        const dbTime = Date.now() - startTime;
        console.log('[Health Check] Database response time:', dbTime, 'ms');
        let serverMetrics = await exports.prisma.serverMetrics.findFirst({
            orderBy: { startTime: 'desc' }
        });
        console.log('[Health Check] Retrieved server metrics:', {
            exists: !!serverMetrics
        });
        if (!serverMetrics) {
            console.log('[Health Check] Creating new server metrics');
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
        console.log('[Health Check] Adding new historical metric');
        await exports.prisma.historicalMetric.create({
            data: {
                apiResponseTime: Date.now() - startTime,
                dbQueryTime: dbTime,
                cpuUsage: process.cpuUsage().user / 1000000,
                memoryUsage: process.memoryUsage().heapUsed / 1024 / 1024,
                requestCount: 1
            }
        });
        console.log('[Health Check] Fetching metrics');
        const historicalMetrics = await exports.prisma.historicalMetric.findMany({
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
            startedAt: serverMetrics.startTime.toISOString(),
            environment: process.env.NODE_ENV
        };
        console.log('[Health Check] Rendering template with data:', {
            metricsCount: historicalMetrics.length,
            statusSnapshot: status
        });
        res.render('health', { status, metrics: historicalMetrics });
    }
    catch (error) {
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
app.use((err, _req, res, _next) => {
    console.error(err.stack);
    res.status(500).json({
        success: false,
        error: 'Internal server error',
    });
});
exports.default = app;
//# sourceMappingURL=app.js.map