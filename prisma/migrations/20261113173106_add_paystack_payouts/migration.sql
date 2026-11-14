/*
  Warnings:

  - You are about to drop the column `flutterwaveTransactionId` on the `Tip` table. All the data in the column will be lost.
  - You are about to drop the column `flutterwaveSubaccountId` on the `User` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[reference]` on the table `Earning` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Earning" ADD COLUMN     "reference" TEXT;

-- AlterTable
ALTER TABLE "Tip" DROP COLUMN "flutterwaveTransactionId",
ADD COLUMN     "paidAt" TIMESTAMP(3),
ADD COLUMN     "paystackTransactionId" TEXT;

-- AlterTable
ALTER TABLE "User" DROP COLUMN "flutterwaveSubaccountId",
ADD COLUMN     "paystackSubaccountCode" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Earning_reference_key" ON "Earning"("reference");
