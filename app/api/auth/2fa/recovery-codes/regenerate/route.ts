import {
  ForbiddenError,
  requireRole,
  UnauthorizedError,
} from "@/lib/auth/current-user";
import { verifyPassword } from "@/lib/auth/password";
import { forbidden, unauthorized } from "@/lib/auth/responses";
import {
  createRecoveryCodes,
  decryptTwoFactorSecret,
  hashRecoveryCode,
  verifyTotpCode,
} from "@/lib/auth/two-factor";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

const invalidVerificationMessage =
  "Не удалось проверить пароль и код двухфакторной аутентификации.";

type RegenerateRecoveryCodesBody = {
  password?: unknown;
  verificationCode?: unknown;
};

class InvalidSecondFactorError extends Error {}

export async function POST(request: Request) {
  let currentUser;

  try {
    currentUser = await requireRole("ADMIN", "DOCTOR");
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      return unauthorized();
    }

    if (error instanceof ForbiddenError) {
      return forbidden();
    }

    throw error;
  }

  const body = (await request.json().catch(() => null)) as
    | RegenerateRecoveryCodesBody
    | null;
  const password =
    typeof body?.password === "string" ? body.password : "";
  const verificationCode =
    typeof body?.verificationCode === "string"
      ? body.verificationCode.trim()
      : "";

  if (!password || !verificationCode) {
    return Response.json(
      { error: invalidVerificationMessage },
      { status: 400 },
    );
  }

  const user = await prisma.user.findUnique({
    where: {
      id: currentUser.id,
    },
    select: {
      passwordHash: true,
      twoFactorSecret: {
        select: {
          enabledAt: true,
          encryptedSecret: true,
          id: true,
        },
      },
    },
  });

  if (
    !user?.twoFactorSecret?.enabledAt ||
    !(await verifyPassword(password, user.passwordHash))
  ) {
    return Response.json(
      { error: invalidVerificationMessage },
      { status: 400 },
    );
  }

  const isTotpCode = /^\d{6}$/.test(verificationCode);
  let recoveryCodeHash: string | null = null;

  if (isTotpCode) {
    const secret = decryptTwoFactorSecret(
      user.twoFactorSecret.encryptedSecret,
    );

    if (!(await verifyTotpCode(secret, verificationCode))) {
      return Response.json(
        { error: invalidVerificationMessage },
        { status: 400 },
      );
    }
  } else {
    recoveryCodeHash = hashRecoveryCode(verificationCode);

    if (!recoveryCodeHash) {
      return Response.json(
        { error: invalidVerificationMessage },
        { status: 400 },
      );
    }
  }

  const recoveryCodes = createRecoveryCodes();
  const regeneratedAt = new Date();

  try {
    await prisma.$transaction(async (tx) => {
      const activeSecret = await tx.twoFactorSecret.findFirst({
        where: {
          enabledAt: {
            not: null,
          },
          id: user.twoFactorSecret!.id,
          userId: currentUser.id,
        },
        select: {
          id: true,
        },
      });

      if (!activeSecret) {
        throw new InvalidSecondFactorError();
      }

      if (recoveryCodeHash) {
        const recoveryCodeUpdate = await tx.twoFactorRecoveryCode.updateMany({
          where: {
            codeHash: recoveryCodeHash,
            usedAt: null,
            userId: currentUser.id,
          },
          data: {
            usedAt: regeneratedAt,
          },
        });

        if (recoveryCodeUpdate.count !== 1) {
          throw new InvalidSecondFactorError();
        }
      }

      await tx.twoFactorRecoveryCode.deleteMany({
        where: {
          usedAt: null,
          userId: currentUser.id,
        },
      });
      await tx.twoFactorRecoveryCode.createMany({
        data: recoveryCodes.map((recoveryCode) => ({
          codeHash: hashRecoveryCode(recoveryCode)!,
          userId: currentUser.id,
        })),
      });
      await tx.auditLog.create({
        data: {
          action: "USER_UPDATED",
          actorId: currentUser.id,
          entityId: currentUser.id,
          entityType: "User",
          metadata: {
            changedFields: ["twoFactorRecoveryCodes"],
            recoveryCodeCount: recoveryCodes.length,
            verificationMethod: recoveryCodeHash
              ? "recovery_code"
              : "totp",
          },
        },
      });
    });
  } catch (error) {
    if (error instanceof InvalidSecondFactorError) {
      return Response.json(
        { error: invalidVerificationMessage },
        { status: 400 },
      );
    }

    throw error;
  }

  return Response.json({
    recoveryCodes,
    remainingRecoveryCodeCount: recoveryCodes.length,
  });
}
