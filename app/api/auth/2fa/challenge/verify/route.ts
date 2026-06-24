import {
  clearTwoFactorChallengeCookie,
  decryptTwoFactorSecret,
  getActiveTwoFactorChallenge,
  hashRecoveryCode,
  recordInvalidTwoFactorAttempt,
  verifyTotpCode,
} from "@/lib/auth/two-factor";
import {
  createSession,
  setSessionCookie,
} from "@/lib/auth/session";
import { getRedirectPathForRole } from "@/lib/auth/current-user";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

type ChallengeVerifyBody = {
  code?: unknown;
};

async function completeTotpChallenge({
  challengeId,
  userId,
  userRole,
}: {
  challengeId: string;
  userId: string;
  userRole: UserRole;
}) {
  const completedAt = new Date();

  return prisma.$transaction(async (tx) => {
    const challengeUpdate = await tx.twoFactorChallenge.updateMany({
      where: {
        completedAt: null,
        expiresAt: {
          gt: completedAt,
        },
        id: challengeId,
      },
      data: {
        completedAt,
      },
    });

    if (challengeUpdate.count !== 1) {
      return false;
    }

    await tx.auditLog.create({
      data: {
        action: "TWO_FACTOR_CHALLENGE_COMPLETED",
        actorId: userId,
        entityId: challengeId,
        entityType: "TwoFactorChallenge",
        metadata: {
          method: "totp",
          userRole,
        },
      },
    });

    return true;
  });
}

async function completeRecoveryChallenge({
  challengeId,
  codeHash,
  userId,
  userRole,
}: {
  challengeId: string;
  codeHash: string;
  userId: string;
  userRole: UserRole;
}) {
  const completedAt = new Date();

  return prisma.$transaction(async (tx) => {
    const recoveryCodeUpdate = await tx.twoFactorRecoveryCode.updateMany({
      where: {
        codeHash,
        usedAt: null,
        userId,
      },
      data: {
        usedAt: completedAt,
      },
    });

    if (recoveryCodeUpdate.count !== 1) {
      return false;
    }

    const challengeUpdate = await tx.twoFactorChallenge.updateMany({
      where: {
        completedAt: null,
        expiresAt: {
          gt: completedAt,
        },
        id: challengeId,
      },
      data: {
        completedAt,
      },
    });

    if (challengeUpdate.count !== 1) {
      throw new Error("Two-factor challenge is no longer active.");
    }

    await tx.auditLog.create({
      data: {
        action: "TWO_FACTOR_RECOVERY_CODE_USED",
        actorId: userId,
        entityId: challengeId,
        entityType: "TwoFactorChallenge",
        metadata: {
          method: "recovery_code",
          userRole,
        },
      },
    });

    return true;
  });
}

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as ChallengeVerifyBody | null;
  const code = typeof body?.code === "string" ? body.code.trim() : "";
  const challenge = await getActiveTwoFactorChallenge();

  if (!challenge || !challenge.user.twoFactorSecret?.enabledAt) {
    await clearTwoFactorChallengeCookie();
    return Response.json(
      { error: "Войдите снова, чтобы продолжить." },
      { status: 401 },
    );
  }

  let completed = false;

  if (/^\d{6}$/.test(code)) {
    const secret = decryptTwoFactorSecret(
      challenge.user.twoFactorSecret.encryptedSecret,
    );

    if (await verifyTotpCode(secret, code)) {
      completed = await completeTotpChallenge({
        challengeId: challenge.id,
        userId: challenge.userId,
        userRole: challenge.user.role,
      });
    }
  } else {
    const codeHash = hashRecoveryCode(code);

    if (codeHash) {
      completed = await completeRecoveryChallenge({
        challengeId: challenge.id,
        codeHash,
        userId: challenge.userId,
        userRole: challenge.user.role,
      });
    }
  }

  if (!completed) {
    const denied = await recordInvalidTwoFactorAttempt(challenge.id);

    if (denied) {
      await clearTwoFactorChallengeCookie();
    }

    return Response.json(
      {
        error: denied
          ? "Войдите снова, чтобы продолжить."
          : "Код подтверждения недействителен.",
      },
      { status: 400 },
    );
  }

  const session = await createSession(challenge.userId);
  await setSessionCookie(session.token, session.expiresAt);
  await clearTwoFactorChallengeCookie();

  return Response.json({
    redirectTo: getRedirectPathForRole(challenge.user.role),
  });
}
import type { UserRole } from "@prisma/client";
