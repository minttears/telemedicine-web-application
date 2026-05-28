-- CreateEnum
CREATE TYPE "AccountAccessTokenType" AS ENUM ('DOCTOR_INVITE', 'PASSWORD_RESET');

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "AuditAction" ADD VALUE 'DOCTOR_INVITE_CREATED';
ALTER TYPE "AuditAction" ADD VALUE 'ACCOUNT_PASSWORD_SET';
ALTER TYPE "AuditAction" ADD VALUE 'PASSWORD_RESET_CREATED';
ALTER TYPE "AuditAction" ADD VALUE 'PASSWORD_RESET_COMPLETED';

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "passwordChangedAt" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "AccountAccessToken" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" "AccountAccessTokenType" NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "usedAt" TIMESTAMP(3),
    "createdById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AccountAccessToken_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "AccountAccessToken_tokenHash_key" ON "AccountAccessToken"("tokenHash");

-- CreateIndex
CREATE INDEX "AccountAccessToken_userId_type_idx" ON "AccountAccessToken"("userId", "type");

-- CreateIndex
CREATE INDEX "AccountAccessToken_expiresAt_idx" ON "AccountAccessToken"("expiresAt");

-- CreateIndex
CREATE INDEX "AccountAccessToken_usedAt_idx" ON "AccountAccessToken"("usedAt");

-- CreateIndex
CREATE INDEX "AccountAccessToken_createdById_idx" ON "AccountAccessToken"("createdById");

-- AddForeignKey
ALTER TABLE "AccountAccessToken" ADD CONSTRAINT "AccountAccessToken_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AccountAccessToken" ADD CONSTRAINT "AccountAccessToken_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
