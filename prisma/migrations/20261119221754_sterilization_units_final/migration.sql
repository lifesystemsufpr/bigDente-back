/*
  Warnings:

  - You are about to drop the `sterilization_cases` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "sterilization_cases" DROP CONSTRAINT "sterilization_cases_student_id_fkey";

-- DropTable
DROP TABLE "sterilization_cases";

-- CreateTable
CREATE TABLE "sterilization_units" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "student_id" INTEGER NOT NULL,
    "type" "SterilizationCase" NOT NULL,
    "submittedForSterilizationAt" TIMESTAMP(3),
    "expectedSterilizationDeliveryAt" TIMESTAMP(3),
    "sterilizationDeliveredAt" TIMESTAMP(3),
    "status" "SterilizationStatus" NOT NULL DEFAULT 'PENDING',
    "error_reason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sterilization_units_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "sterilization_units_code_key" ON "sterilization_units"("code");

-- CreateIndex
CREATE INDEX "sterilization_units_student_id_status_idx" ON "sterilization_units"("student_id", "status");

-- CreateIndex
CREATE INDEX "sterilization_units_student_id_createdAt_idx" ON "sterilization_units"("student_id", "createdAt");

-- CreateIndex
CREATE INDEX "sterilization_units_status_idx" ON "sterilization_units"("status");

-- CreateIndex
CREATE INDEX "sterilization_units_expectedSterilizationDeliveryAt_idx" ON "sterilization_units"("expectedSterilizationDeliveryAt");

-- AddForeignKey
ALTER TABLE "sterilization_units" ADD CONSTRAINT "sterilization_units_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "students"("student_id") ON DELETE CASCADE ON UPDATE CASCADE;
