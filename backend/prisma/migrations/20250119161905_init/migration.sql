/*
  Warnings:

  - You are about to drop the `User` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE "User";

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "phoneNumber" TEXT NOT NULL,
    "deviceId" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "lastLoginAt" TIMESTAMP(3),
    "otpSecret" TEXT,
    "otpValidUntil" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "otp_attempts" (
    "id" TEXT NOT NULL,
    "phoneNumber" TEXT NOT NULL,
    "attemptedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "isSuccess" BOOLEAN NOT NULL DEFAULT false,
    "ipAddress" TEXT NOT NULL,

    CONSTRAINT "otp_attempts_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_phoneNumber_key" ON "users"("phoneNumber");

-- CreateIndex
CREATE INDEX "otp_attempts_phoneNumber_attemptedAt_idx" ON "otp_attempts"("phoneNumber", "attemptedAt");

-- AddForeignKey
ALTER TABLE "otp_attempts" ADD CONSTRAINT "otp_attempts_phoneNumber_fkey" FOREIGN KEY ("phoneNumber") REFERENCES "users"("phoneNumber") ON DELETE RESTRICT ON UPDATE CASCADE;
