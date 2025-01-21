"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.prisma = void 0;
const client_1 = require("@prisma/client");
const dotenv_1 = require("dotenv");
(0, dotenv_1.config)({ path: '.env.test' });
exports.prisma = new client_1.PrismaClient();
describe('Database Setup', () => {
    it('should connect to the test database', async () => {
        await expect(exports.prisma.$connect()).resolves.not.toThrow();
    });
});
beforeAll(async () => {
    await exports.prisma.$connect();
});
afterAll(async () => {
    const tablenames = await exports.prisma.$queryRaw `SELECT tablename FROM pg_tables WHERE schemaname='public'`;
    const tables = tablenames
        .map(({ tablename }) => tablename)
        .filter((name) => name !== '_prisma_migrations')
        .map((name) => `"public"."${name}"`)
        .join(', ');
    try {
        await exports.prisma.$executeRawUnsafe(`TRUNCATE TABLE ${tables} CASCADE;`);
    }
    catch (error) {
        console.log('Error cleaning up test database:', error);
    }
    await exports.prisma.$disconnect();
});
//# sourceMappingURL=setup.js.map