import "server-only";

import {
  createCipheriv,
  createDecipheriv,
  createHash,
  randomBytes,
} from "node:crypto";

import { cookies } from "next/headers";
import { generateSecret, generateURI, verify } from "otplib";

import { prisma } from "@/lib/prisma";

export const TWO_FACTOR_CHALLENGE_COOKIE_NAME =
  "telemedicine_2fa_challenge";
export const TWO_FACTOR_CHALLENGE_MAX_ATTEMPTS = 5;

const CHALLENGE_DURATION_MS = 10 * 60 * 1000;
const ENCRYPTION_VERSION = "v1";
const RECOVERY_CODE_COUNT = 10;

export function isTwoFactorEnforcementEnabled() {
  return process.env.TWO_FACTOR_ENFORCEMENT_ENABLED !== "false";
}

export function isTwoFactorRequiredRole(role: string) {
  return role === "ADMIN" || role === "DOCTOR";
}

function getEncryptionKey() {
  const configuredKey = process.env.TWO_FACTOR_ENCRYPTION_KEY?.trim();

  if (!configuredKey) {
    throw new Error("Two-factor authentication encryption is not configured.");
  }

  let key: Buffer;

  try {
    key = Buffer.from(configuredKey, "base64url");
  } catch {
    throw new Error("Two-factor authentication encryption is not configured.");
  }

  if (key.length !== 32) {
    throw new Error("Two-factor authentication encryption is not configured.");
  }

  return key;
}

export function encryptTwoFactorSecret(secret: string) {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", getEncryptionKey(), iv);
  const encrypted = Buffer.concat([
    cipher.update(secret, "utf8"),
    cipher.final(),
  ]);
  const authTag = cipher.getAuthTag();

  return [
    ENCRYPTION_VERSION,
    iv.toString("base64url"),
    authTag.toString("base64url"),
    encrypted.toString("base64url"),
  ].join(".");
}

export function decryptTwoFactorSecret(payload: string) {
  const [version, ivValue, authTagValue, encryptedValue] = payload.split(".");

  if (
    version !== ENCRYPTION_VERSION ||
    !ivValue ||
    !authTagValue ||
    !encryptedValue
  ) {
    throw new Error("Stored two-factor authentication data is invalid.");
  }

  try {
    const decipher = createDecipheriv(
      "aes-256-gcm",
      getEncryptionKey(),
      Buffer.from(ivValue, "base64url"),
    );
    decipher.setAuthTag(Buffer.from(authTagValue, "base64url"));

    return Buffer.concat([
      decipher.update(Buffer.from(encryptedValue, "base64url")),
      decipher.final(),
    ]).toString("utf8");
  } catch {
    throw new Error("Stored two-factor authentication data is invalid.");
  }
}

export function createTotpSecret() {
  return generateSecret({ length: 20 });
}

export function createTotpUri({
  email,
  secret,
}: {
  email: string;
  secret: string;
}) {
  return generateURI({
    issuer: "Telemedicine",
    label: email,
    secret,
  });
}

export async function verifyTotpCode(secret: string, code: string) {
  if (!/^\d{6}$/.test(code)) {
    return false;
  }

  const result = await verify({
    // Accept only the current 30-second TOTP step. Device and server clocks
    // must remain synchronized; recovery codes are the fallback when needed.
    epochTolerance: 0,
    secret,
    token: code,
  });

  return result.valid;
}

export function hashTwoFactorValue(value: string) {
  return createHash("sha256").update(value).digest("hex");
}

function createChallengeToken() {
  return randomBytes(32).toString("base64url");
}

export async function createTwoFactorChallenge(userId: string) {
  const rawToken = createChallengeToken();
  const expiresAt = new Date(Date.now() + CHALLENGE_DURATION_MS);
  const now = new Date();

  await prisma.$transaction([
    prisma.twoFactorChallenge.updateMany({
      where: {
        completedAt: null,
        userId,
      },
      data: {
        completedAt: now,
      },
    }),
    prisma.twoFactorChallenge.create({
      data: {
        expiresAt,
        tokenHash: hashTwoFactorValue(rawToken),
        userId,
      },
    }),
  ]);

  return { expiresAt, rawToken };
}

export async function setTwoFactorChallengeCookie(
  rawToken: string,
  expiresAt: Date,
) {
  const cookieStore = await cookies();

  cookieStore.set(TWO_FACTOR_CHALLENGE_COOKIE_NAME, rawToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires: expiresAt,
  });
}

export async function getTwoFactorChallengeCookie() {
  const cookieStore = await cookies();

  return cookieStore.get(TWO_FACTOR_CHALLENGE_COOKIE_NAME)?.value ?? null;
}

export async function clearTwoFactorChallengeCookie() {
  const cookieStore = await cookies();

  cookieStore.set(TWO_FACTOR_CHALLENGE_COOKIE_NAME, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires: new Date(0),
  });
}

export async function getActiveTwoFactorChallenge() {
  const rawToken = await getTwoFactorChallengeCookie();

  if (!rawToken) {
    return null;
  }

  return prisma.twoFactorChallenge.findFirst({
    where: {
      attempts: {
        lt: TWO_FACTOR_CHALLENGE_MAX_ATTEMPTS,
      },
      completedAt: null,
      expiresAt: {
        gt: new Date(),
      },
      tokenHash: hashTwoFactorValue(rawToken),
      user: {
        isActive: true,
        role: {
          in: ["ADMIN", "DOCTOR"],
        },
      },
    },
    select: {
      attempts: true,
      expiresAt: true,
      id: true,
      user: {
        select: {
          email: true,
          id: true,
          role: true,
          twoFactorSecret: {
            select: {
              enabledAt: true,
              encryptedSecret: true,
            },
          },
        },
      },
      userId: true,
    },
  });
}

export async function recordInvalidTwoFactorAttempt(challengeId: string) {
  const result = await prisma.twoFactorChallenge.updateMany({
    where: {
      attempts: {
        lt: TWO_FACTOR_CHALLENGE_MAX_ATTEMPTS,
      },
      completedAt: null,
      expiresAt: {
        gt: new Date(),
      },
      id: challengeId,
    },
    data: {
      attempts: {
        increment: 1,
      },
    },
  });

  if (result.count !== 1) {
    return true;
  }

  const challenge = await prisma.twoFactorChallenge.findUnique({
    where: { id: challengeId },
    select: { attempts: true },
  });

  return (
    !challenge ||
    challenge.attempts >= TWO_FACTOR_CHALLENGE_MAX_ATTEMPTS
  );
}

export function createRecoveryCodes() {
  return Array.from({ length: RECOVERY_CODE_COUNT }, () => {
    const value = randomBytes(10).toString("hex").toUpperCase();
    return value.match(/.{1,4}/g)!.join("-");
  });
}

export function normalizeRecoveryCode(value: string) {
  const normalized = value.replace(/[^a-zA-Z0-9]/g, "").toUpperCase();

  if (!/^[A-F0-9]{20}$/.test(normalized)) {
    return null;
  }

  return normalized;
}

export function hashRecoveryCode(value: string) {
  const normalized = normalizeRecoveryCode(value);

  return normalized ? hashTwoFactorValue(normalized) : null;
}
