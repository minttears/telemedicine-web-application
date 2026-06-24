/*
  Warnings:

  - You are about to drop the column `secretHash` on the `TwoFactorSecret` table. All the data in the column will be lost.
  - Added the required column `encryptedSecret` to the `TwoFactorSecret` table without a default value. This is not possible if the table is not empty.

*/
-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "AuditAction" ADD VALUE 'TWO_FACTOR_SETUP_COMPLETED';
ALTER TYPE "AuditAction" ADD VALUE 'TWO_FACTOR_CHALLENGE_COMPLETED';
ALTER TYPE "AuditAction" ADD VALUE 'TWO_FACTOR_RECOVERY_CODE_USED';

-- AlterTable
ALTER TABLE "TwoFactorSecret" DROP COLUMN "secretHash",
ADD COLUMN     "encryptedSecret" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "TwoFactorChallenge" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TwoFactorChallenge_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "TwoFactorChallenge_tokenHash_key" ON "TwoFactorChallenge"("tokenHash");

-- CreateIndex
CREATE INDEX "TwoFactorChallenge_userId_idx" ON "TwoFactorChallenge"("userId");

-- CreateIndex
CREATE INDEX "TwoFactorChallenge_expiresAt_idx" ON "TwoFactorChallenge"("expiresAt");

-- CreateIndex
CREATE INDEX "TwoFactorRecoveryCode_userId_usedAt_idx" ON "TwoFactorRecoveryCode"("userId", "usedAt");

-- AddForeignKey
ALTER TABLE "TwoFactorChallenge" ADD CONSTRAINT "TwoFactorChallenge_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
