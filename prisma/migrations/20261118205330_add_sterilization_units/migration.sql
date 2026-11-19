
-- CreateEnum
CREATE TYPE "SterilizationCase" AS ENUM ('CASE', 'PACK');

-- CreateEnum
CREATE TYPE "SterilizationStatus" AS ENUM (
    'PENDING',
    'ERROR',
    'SUBMITTED',
    'COMPLETED',
    'DELIVERED',
    'CANCELLED'
);

-- CreateTable
CREATE TABLE "sterilization_cases" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "student_id" INTEGER NOT NULL,
    "type" "SterilizationCase" NOT NULL,
    "submittedForSterilizationAt" TIMESTAMP(3),
    "expectedSterilizationDeliveryAt" TIMESTAMP(3),
    "sterilizationDeliveredAt" TIMESTAMP(3),
    "status" "SterilizationStatus" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sterilization_cases_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "sterilization_cases_code_key"
ON "sterilization_cases"("code");

-- CreateIndex
CREATE INDEX "sterilization_cases_student_id_status_idx"
ON "sterilization_cases"("student_id", "status");

-- CreateIndex
CREATE INDEX "sterilization_cases_status_createdAt_idx"
ON "sterilization_cases"("status", "createdAt");

-- AddForeignKey
ALTER TABLE "sterilization_cases"
ADD CONSTRAINT "sterilization_cases_student_id_fkey"
FOREIGN KEY ("student_id")
REFERENCES "students"("student_id")
ON DELETE CASCADE
ON UPDATE CASCADE;
