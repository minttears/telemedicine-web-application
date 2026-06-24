import {
  clearTwoFactorChallengeCookie,
  createRecoveryCodes,
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

type SetupConfirmBody = {
  code?: unknown;
};

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as SetupConfirmBody | null;
  const code = typeof body?.code === "string" ? body.code.trim() : "";
  const challenge = await getActiveTwoFactorChallenge();

  if (!challenge) {
    await clearTwoFactorChallengeCookie();
    return Response.json(
      { error: "Войдите снова, чтобы продолжить." },
      { status: 401 },
    );
  }

  const twoFactorSecret = await prisma.twoFactorSecret.findUnique({
    where: {
      userId: challenge.userId,
    },
    select: {
      enabledAt: true,
      encryptedSecret: true,
      id: true,
    },
  });

  if (!twoFactorSecret || twoFactorSecret.enabledAt) {
    return Response.json(
      { error: "Не удалось завершить настройку двухфакторной аутентификации." },
      { status: 409 },
    );
  }

  const secret = decryptTwoFactorSecret(twoFactorSecret.encryptedSecret);
  const isValid = await verifyTotpCode(secret, code);

  if (!isValid) {
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

  const recoveryCodes = createRecoveryCodes();
  const enabledAt = new Date();

  let completed = false;

  try {
    await prisma.$transaction(async (tx) => {
      const secretUpdate = await tx.twoFactorSecret.updateMany({
        where: {
          enabledAt: null,
          id: twoFactorSecret.id,
          userId: challenge.userId,
        },
        data: {
          enabledAt,
        },
      });
      const challengeUpdate = await tx.twoFactorChallenge.updateMany({
        where: {
          completedAt: null,
          expiresAt: {
            gt: enabledAt,
          },
          id: challenge.id,
        },
        data: {
          completedAt: enabledAt,
        },
      });

      if (secretUpdate.count !== 1 || challengeUpdate.count !== 1) {
        throw new Error("Two-factor setup is no longer active.");
      }

      await tx.twoFactorRecoveryCode.deleteMany({
        where: {
          userId: challenge.userId,
        },
      });
      await tx.twoFactorRecoveryCode.createMany({
        data: recoveryCodes.map((recoveryCode) => ({
          codeHash: hashRecoveryCode(recoveryCode)!,
          userId: challenge.userId,
        })),
      });
      await tx.session.updateMany({
        where: {
          revokedAt: null,
          userId: challenge.userId,
        },
        data: {
          revokedAt: enabledAt,
        },
      });
      await tx.auditLog.create({
        data: {
          action: "TWO_FACTOR_SETUP_COMPLETED",
          actorId: challenge.userId,
          entityId: twoFactorSecret.id,
          entityType: "TwoFactorSecret",
          metadata: {
            recoveryCodeCount: recoveryCodes.length,
            userRole: challenge.user.role,
          },
        },
      });
    });
    completed = true;
  } catch {
    completed = false;
  }

  if (!completed) {
    await clearTwoFactorChallengeCookie();
    return Response.json(
      { error: "Войдите снова, чтобы продолжить." },
      { status: 409 },
    );
  }

  const session = await createSession(challenge.userId);
  await setSessionCookie(session.token, session.expiresAt);
  await clearTwoFactorChallengeCookie();

  return Response.json({
    recoveryCodes,
    redirectTo: getRedirectPathForRole(challenge.user.role),
  });
}
