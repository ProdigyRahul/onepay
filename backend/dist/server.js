"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const app_1 = __importDefault(require("./app"));
const app_2 = require("./app");
const PORT = process.env.PORT || 3000;
const startServer = async () => {
    try {
        await app_2.prisma.$connect();
        console.log('✅ Connected to database successfully');
        app_1.default.listen(PORT, () => {
            console.log(`🚀 Server running on port ${PORT}`);
        });
    }
    catch (error) {
        console.error('❌ Error starting server:', error);
        process.exit(1);
    }
};
process.on('SIGTERM', async () => {
    console.log('SIGTERM signal received: closing HTTP server');
    await app_2.prisma.$disconnect();
    process.exit(0);
});
startServer();
//# sourceMappingURL=server.js.map