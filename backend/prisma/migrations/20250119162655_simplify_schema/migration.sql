/*
  Warnings:

  - You are about to drop the column `deviceId` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `isActive` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `otpSecret` on the `users` table. All the data in the column will be lost.
  - You are about to drop the `otp_attempts` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "otp_attempts" DROP CONSTRAINT "otp_attempts_phoneNumber_fkey";

-- AlterTable
ALTER TABLE "users" DROP COLUMN "deviceId",
DROP COLUMN "isActive",
DROP COLUMN "otpSecret";

-- DropTable
DROP TABLE "otp_attempts";
