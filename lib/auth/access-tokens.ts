import "server-only";

import { createHash, randomBytes } from "node:crypto";

import type { AccountAccessTokenType } from "@prisma/client";

import { prisma } from "@/lib/prisma";

const ACCESS_TOKEN_BYTES = 32;

export function createRawAccountAccessToken() {
  return randomBytes(ACCESS_TOKEN_BYTES).toString("base64url");
}

export function hashAccountAccessToken(rawToken: string) {
  return createHash("sha256").update(rawToken).digest("hex");
}

export async function createAccountAccessToken({
  createdById,
  expiresAt,
  type,
  userId,
}: {
  createdById?: string | null;
  expiresAt: Date;
  type: AccountAccessTokenType;
  userId: string;
}) {
  const rawToken = createRawAccountAccessToken();
  const tokenHash = hashAccountAccessToken(rawToken);

  const accessToken = await prisma.accountAccessToken.create({
    data: {
      createdById: createdById ?? null,
      expiresAt,
      tokenHash,
      type,
      userId,
    },
  });

  return {
    accessToken,
    rawToken,
  };
}

export async function findValidAccountAccessToken({
  rawToken,
  type,
}: {
  rawToken: string;
  type: AccountAccessTokenType;
}) {
  const tokenHash = hashAccountAccessToken(rawToken);

  return prisma.accountAccessToken.findFirst({
    where: {
      expiresAt: {
        gt: new Date(),
      },
      tokenHash,
      type,
      usedAt: null,
    },
    select: {
      createdAt: true,
      createdById: true,
      expiresAt: true,
      id: true,
      type: true,
      usedAt: true,
      user: {
        select: {
          email: true,
          id: true,
          isActive: true,
          name: true,
          role: true,
        },
      },
      userId: true,
    },
  });
}

export async function markAccountAccessTokenUsed(accessTokenId: string) {
  return prisma.accountAccessToken.updateMany({
    where: {
      id: accessTokenId,
      usedAt: null,
    },
    data: {
      usedAt: new Date(),
    },
  });
}
