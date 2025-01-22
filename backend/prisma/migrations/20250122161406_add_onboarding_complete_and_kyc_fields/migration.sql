-- AlterEnum
ALTER TYPE "KYCStatus" ADD VALUE 'PENDING_VERIFICATION';

-- AlterTable
ALTER TABLE "kyc" ADD COLUMN     "panCardPath" TEXT,
ADD COLUMN     "remarks" TEXT,
ADD COLUMN     "verifiedAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "onboardingComplete" BOOLEAN NOT NULL DEFAULT false;
