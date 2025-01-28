"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = __importDefault(require("./app"));
const client_1 = require("@prisma/client");
const logger_1 = __importDefault(require("./utils/logger"));
const prisma = new client_1.PrismaClient();
const PORT = process.env.PORT || 3000;
const startServer = async () => {
    try {
        await prisma.$connect();
        logger_1.default.info('✅ Connected to database successfully');
        await prisma.serverMetrics.create({
            data: {
                cpuUsage: process.cpuUsage().user / 1000000,
                memoryUsage: process.memoryUsage().heapUsed / 1024 / 1024,
                diskUsage: 0,
                activeUsers: 0,
                totalRequests: 0
            }
        });
        app_1.default.listen(PORT, () => {
            logger_1.default.info(`🚀 Server running on port ${PORT}`);
        });
    }
    catch (error) {
        logger_1.default.error('❌ Error starting server:', error);
        process.exit(1);
    }
};
process.on('SIGTERM', async () => {
    console.log('SIGTERM signal received: closing HTTP server');
    await prisma.$disconnect();
    process.exit(0);
});
startServer();
//# sourceMappingURL=server.js.map