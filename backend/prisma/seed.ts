import { PrismaClient, Role, KYCStatus } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  // Create dummy admin user
  const adminUser = await prisma.user.upsert({
    where: { phoneNumber: '+919999999999' },
    update: {},
    create: {
      phoneNumber: '+919999999999',
      firstName: 'Admin',
      lastName: 'User',
      email: 'admin@onepay.dev',
      password: await bcrypt.hash('Admin@123', 10), // Add secure password
      role: Role.ADMIN,
      isVerified: true,
      onboardingComplete: true,
      isActive: true,
      // Create KYC record
      kyc: {
        create: {
          panNumber: 'ADMIN9999A',
          dateOfBirth: new Date('1990-01-01'),
          status: KYCStatus.VERIFIED,
          verifiedAt: new Date(),
        },
      },
      // Create wallet
      wallet: {
        create: {
          balance: 100000,
          pin: await bcrypt.hash('1234', 10),
          accountNumber: 'ADMIN0000001',
          dailyLimit: 100000,
          monthlyLimit: 1000000,
        },
      },
    },
  });

  console.log('Created admin user:', adminUser);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
