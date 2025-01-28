/*
  Warnings:

  - You are about to drop the column `serverMetricsId` on the `historical_metrics` table. All the data in the column will be lost.
  - You are about to drop the column `apiResponseTime` on the `server_metrics` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `server_metrics` table. All the data in the column will be lost.
  - You are about to drop the column `dbQueryTime` on the `server_metrics` table. All the data in the column will be lost.
  - You are about to drop the column `endpoint` on the `server_metrics` table. All the data in the column will be lost.
  - You are about to drop the column `lastRestartTime` on the `server_metrics` table. All the data in the column will be lost.
  - You are about to drop the column `timestamp` on the `server_metrics` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `server_metrics` table. All the data in the column will be lost.
  - Added the required column `cpuUsage` to the `historical_metrics` table without a default value. This is not possible if the table is not empty.
  - Added the required column `memoryUsage` to the `historical_metrics` table without a default value. This is not possible if the table is not empty.
  - Added the required column `requestCount` to the `historical_metrics` table without a default value. This is not possible if the table is not empty.
  - Added the required column `lastUpdateTime` to the `server_metrics` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "historical_metrics" DROP CONSTRAINT "historical_metrics_serverMetricsId_fkey";

-- DropIndex
DROP INDEX "historical_metrics_timestamp_idx";

-- DropIndex
DROP INDEX "server_metrics_timestamp_idx";

-- AlterTable
ALTER TABLE "historical_metrics" DROP COLUMN "serverMetricsId",
ADD COLUMN     "cpuUsage" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "memoryUsage" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "requestCount" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "server_metrics" DROP COLUMN "apiResponseTime",
DROP COLUMN "createdAt",
DROP COLUMN "dbQueryTime",
DROP COLUMN "endpoint",
DROP COLUMN "lastRestartTime",
DROP COLUMN "timestamp",
DROP COLUMN "updatedAt",
ADD COLUMN     "activeUsers" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "cpuUsage" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "diskUsage" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "lastUpdateTime" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "memoryUsage" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "totalRequests" INTEGER NOT NULL DEFAULT 0;
