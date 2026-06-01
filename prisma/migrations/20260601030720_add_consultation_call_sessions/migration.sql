-- CreateEnum
CREATE TYPE "ConsultationCallSessionStatus" AS ENUM ('CREATED', 'ACTIVE', 'ENDED');

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "AuditAction" ADD VALUE 'VIDEO_CALL_SESSION_CREATED';
ALTER TYPE "AuditAction" ADD VALUE 'VIDEO_CALL_JOIN_TOKEN_CREATED';

-- CreateTable
CREATE TABLE "ConsultationCallSession" (
    "id" TEXT NOT NULL,
    "consultationId" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "providerRoomName" TEXT NOT NULL,
    "providerRoomUrl" TEXT,
    "status" "ConsultationCallSessionStatus" NOT NULL DEFAULT 'CREATED',
    "createdByUserId" TEXT,
    "startedAt" TIMESTAMP(3),
    "endedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ConsultationCallSession_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ConsultationCallSession_consultationId_idx" ON "ConsultationCallSession"("consultationId");

-- CreateIndex
CREATE INDEX "ConsultationCallSession_status_idx" ON "ConsultationCallSession"("status");

-- CreateIndex
CREATE INDEX "ConsultationCallSession_createdByUserId_idx" ON "ConsultationCallSession"("createdByUserId");

-- CreateIndex
CREATE UNIQUE INDEX "ConsultationCallSession_consultationId_providerRoomName_key" ON "ConsultationCallSession"("consultationId", "providerRoomName");

-- AddForeignKey
ALTER TABLE "ConsultationCallSession" ADD CONSTRAINT "ConsultationCallSession_consultationId_fkey" FOREIGN KEY ("consultationId") REFERENCES "Consultation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ConsultationCallSession" ADD CONSTRAINT "ConsultationCallSession_createdByUserId_fkey" FOREIGN KEY ("createdByUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
