-- AlterTable
ALTER TABLE "User" ADD COLUMN     "legalConsentVersion" TEXT,
ADD COLUMN     "privacyAcceptedAt" TIMESTAMP(3),
ADD COLUMN     "telemedicineConsentAcceptedAt" TIMESTAMP(3),
ADD COLUMN     "termsAcceptedAt" TIMESTAMP(3);
