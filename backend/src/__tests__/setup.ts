import { PrismaClient } from '@prisma/client';
import { config } from 'dotenv';

// Load environment variables
config({ path: '.env.test' });

// Create Prisma client for tests
export const prisma = new PrismaClient();

describe('Database Setup', () => {
  it('should connect to the test database', async () => {
    // Test database connection
    await expect(prisma.$connect()).resolves.not.toThrow();
  });
});

// Global setup
beforeAll(async () => {
  // Connect to test database
  await prisma.$connect();
});

// Global teardown
afterAll(async () => {
  // Clean up database
  const tablenames = await prisma.$queryRaw<
    Array<{ tablename: string }>
  >`SELECT tablename FROM pg_tables WHERE schemaname='public'`;

  const tables = tablenames
    .map(({ tablename }) => tablename)
    .filter((name) => name !== '_prisma_migrations')
    .map((name) => `"public"."${name}"`)
    .join(', ');

  try {
    await prisma.$executeRawUnsafe(`TRUNCATE TABLE ${tables} CASCADE;`);
  } catch (error) {
    console.log('Error cleaning up test database:', error);
  }

  // Disconnect Prisma
  await prisma.$disconnect();
}); 