import { hashPassword } from "@/lib/auth/password";
import { findValidAccountAccessToken } from "@/lib/auth/access-tokens";
import { prisma } from "@/lib/prisma";

const invalidResetMessage = "This password reset link is invalid or expired.";

type ResetPasswordBody = {
  confirmPassword?: unknown;
  password?: unknown;
  token?: unknown;
};

function isResetPasswordBody(value: unknown): value is ResetPasswordBody {
  return Boolean(value && typeof value === "object");
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);

  if (!isResetPasswordBody(body)) {
    return Response.json({ error: invalidResetMessage }, { status: 400 });
  }

  const token = typeof body.token === "string" ? body.token.trim() : "";
  const password = typeof body.password === "string" ? body.password : "";
  const confirmPassword =
    typeof body.confirmPassword === "string" ? body.confirmPassword : "";

  if (!token) {
    return Response.json({ error: invalidResetMessage }, { status: 400 });
  }

  if (password.length < 8) {
    return Response.json(
      { error: "Password must be at least 8 characters." },
      { status: 400 },
    );
  }

  if (password !== confirmPassword) {
    return Response.json({ error: "Passwords must match." }, { status: 400 });
  }

  const resetToken = await findValidAccountAccessToken({
    rawToken: token,
    type: "PASSWORD_RESET",
  });

  if (!resetToken || resetToken.user.role !== "DOCTOR") {
    return Response.json({ error: invalidResetMessage }, { status: 400 });
  }

  const passwordHash = await hashPassword(password);
  const passwordChangedAt = new Date();

  const result = await prisma.$transaction(async (tx) => {
    const doctorProfile = await tx.doctorProfile.findUnique({
      where: {
        userId: resetToken.userId,
      },
      select: {
        id: true,
      },
    });

    if (!doctorProfile) {
      return { success: false };
    }

    const tokenUpdate = await tx.accountAccessToken.updateMany({
      where: {
        expiresAt: {
          gt: new Date(),
        },
        id: resetToken.id,
        type: "PASSWORD_RESET",
        usedAt: null,
      },
      data: {
        usedAt: passwordChangedAt,
      },
    });

    if (tokenUpdate.count !== 1) {
      return { success: false };
    }

    await tx.user.update({
      where: {
        id: resetToken.userId,
      },
      data: {
        passwordChangedAt,
        passwordHash,
      },
    });

    await tx.session.updateMany({
      where: {
        revokedAt: null,
        userId: resetToken.userId,
      },
      data: {
        revokedAt: passwordChangedAt,
      },
    });

    await tx.auditLog.create({
      data: {
        action: "PASSWORD_RESET_COMPLETED",
        actorId: resetToken.userId,
        entityId: resetToken.userId,
        entityType: "User",
        metadata: {
          changedFields: ["passwordChangedAt"],
          doctorProfileId: doctorProfile.id,
          tokenType: "PASSWORD_RESET",
          userId: resetToken.userId,
        },
      },
    });

    return { success: true };
  });

  if (!result.success) {
    return Response.json({ error: invalidResetMessage }, { status: 400 });
  }

  return Response.json({
    redirectTo: "/login?passwordReset=1",
    success: true,
  });
}
