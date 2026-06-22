-- CreateEnum
CREATE TYPE "SalesSource" AS ENUM ('MANUAL', 'SQUARE');

-- CreateTable
CREATE TABLE "DailySales" (
    "id" TEXT NOT NULL,
    "businessDate" DATE NOT NULL,
    "grossSalesCents" INTEGER NOT NULL,
    "netSalesCents" INTEGER,
    "transactionCount" INTEGER,
    "source" "SalesSource" NOT NULL DEFAULT 'MANUAL',
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DailySales_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "DailySales_businessDate_key" ON "DailySales"("businessDate");
