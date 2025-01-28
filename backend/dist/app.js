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
        await exports.prisma.$queryRaw `SELECT 1`;
        const dbTime = Date.now() - startTime;
        const serverMetrics = await exports.prisma.serverMetrics.findFirst({
            orderBy: { startTime: 'desc' }
        });
        await exports.prisma.serverMetrics.create({
            data: {
                responseTime: Date.now() - startTime,
                dbQueryTime: dbTime,
                timestamp: new Date()
            }
        });
        const lastDayMetrics = await exports.prisma.serverMetrics.findMany({
            where: {
                timestamp: {
                    gte: new Date(Date.now() - 24 * 60 * 60 * 1000)
                }
            },
            orderBy: {
                timestamp: 'asc'
            }
        });
        const uptime = serverMetrics
            ? Math.floor((Date.now() - serverMetrics.startTime.getTime()) / 1000)
            : 0;
        const status = {
            timestamp: new Date().toISOString(),
            status: 'healthy',
            services: {
                database: 'connected',
                api: 'running'
            },
            performance: {
                currentDbResponse: `${dbTime}ms`,
                currentApiResponse: `${Date.now() - startTime}ms`
            },
            uptime,
            startedAt: serverMetrics === null || serverMetrics === void 0 ? void 0 : serverMetrics.startTime.toISOString(),
            environment: process.env.NODE_ENV
        };
        const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>OnePay Health Status</title>
          <script src="https://cdn.plot.ly/plotly-2.24.1.min.js"></script>
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
            .graph-container {
              background: white;
              border-radius: 10px;
              padding: 20px;
              margin-top: 20px;
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
                <strong>Current DB Response</strong>
                <span>${status.performance.currentDbResponse}</span>
              </div>
              <div class="service">
                <strong>Current API Response</strong>
                <span>${status.performance.currentApiResponse}</span>
              </div>
              <div class="service">
                <strong>Environment</strong>
                <span>${status.environment}</span>
              </div>
              <div class="service">
                <strong>Server Started At</strong>
                <span>${status.startedAt ? new Date(status.startedAt).toLocaleString() : 'Unknown'}</span>
              </div>
              <div class="service">
                <strong>Uptime</strong>
                <span>${Math.floor(uptime / 86400)}d ${Math.floor((uptime % 86400) / 3600)}h ${Math.floor((uptime % 3600) / 60)}m ${uptime % 60}s</span>
              </div>
              <div class="service">
                <strong>Last Checked</strong>
                <span>${new Date(status.timestamp).toLocaleString()}</span>
              </div>
            </div>
            
            <div class="graph-container">
              <div id="performanceChart"></div>
            </div>
          </div>

          <script>
            const metrics = ${JSON.stringify(lastDayMetrics)};
            
            const apiTrace = {
              x: metrics.map(m => new Date(m.timestamp)),
              y: metrics.map(m => m.responseTime),
              type: 'scatter',
              mode: 'lines',
              name: 'API Response Time (ms)',
              line: { color: '#2563EB' }
            };

            const dbTrace = {
              x: metrics.map(m => new Date(m.timestamp)),
              y: metrics.map(m => m.dbQueryTime),
              type: 'scatter',
              mode: 'lines',
              name: 'DB Query Time (ms)',
              line: { color: '#10B981' }
            };

            const layout = {
              title: 'Response Times (Last 24 Hours)',
              xaxis: { 
                title: 'Time',
                gridcolor: '#E5E7EB'
              },
              yaxis: { 
                title: 'Response Time (ms)',
                gridcolor: '#E5E7EB'
              },
              paper_bgcolor: 'white',
              plot_bgcolor: 'white',
              font: { color: '#1F2937' }
            };

            Plotly.newPlot('performanceChart', [apiTrace, dbTrace], layout);

            // Auto-refresh every 30 seconds
            setInterval(() => {
              window.location.reload();
            }, 30000);
          </script>
        </body>
      </html>
    `;
        res.send(html);
    }
    catch (error) {
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
              <p>${error instanceof Error ? error.message : 'Unknown error'}</p>
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
    console.error(err.stack);
    res.status(500).json({
        success: false,
        error: 'Internal server error',
    });
});
exports.default = app;
//# sourceMappingURL=app.js.map