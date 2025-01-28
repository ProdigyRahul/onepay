-- CreateTable
CREATE TABLE "historical_metrics" (
    "id" TEXT NOT NULL,
    "serverMetricsId" TEXT NOT NULL,
    "apiResponseTime" DOUBLE PRECISION NOT NULL,
    "dbQueryTime" DOUBLE PRECISION NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "historical_metrics_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "historical_metrics_timestamp_idx" ON "historical_metrics"("timestamp");

-- AddForeignKey
ALTER TABLE "historical_metrics" ADD CONSTRAINT "historical_metrics_serverMetricsId_fkey" FOREIGN KEY ("serverMetricsId") REFERENCES "server_metrics"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
