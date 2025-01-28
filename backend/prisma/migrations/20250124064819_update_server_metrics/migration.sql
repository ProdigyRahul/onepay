/*
  Warnings:

  - You are about to drop the column `responseTime` on the `server_metrics` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "server_metrics" DROP COLUMN "responseTime",
ADD COLUMN     "apiResponseTime" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "endpoint" TEXT NOT NULL DEFAULT '/health';

-- CreateIndex
CREATE INDEX "server_metrics_timestamp_idx" ON "server_metrics"("timestamp");
