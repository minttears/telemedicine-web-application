-- CreateEnum
CREATE TYPE "ConsultationDiagnosisStatus" AS ENUM ('NOT_IDENTIFIED', 'PRELIMINARY', 'REQUIRES_FURTHER_EXAMINATION', 'REFERRED_TO_SPECIALIST', 'NOT_APPLICABLE');

-- AlterTable
ALTER TABLE "Consultation" ADD COLUMN     "additionalNotes" TEXT,
ADD COLUMN     "diagnosisDetails" TEXT,
ADD COLUMN     "diagnosisStatus" "ConsultationDiagnosisStatus",
ADD COLUMN     "followUpInstructions" TEXT,
ADD COLUMN     "medicationNotes" TEXT,
ADD COLUMN     "recommendations" TEXT;
