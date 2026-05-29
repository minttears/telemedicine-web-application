import { hashPassword } from "@/lib/auth/password";
import { findValidAccountAccessToken } from "@/lib/auth/access-tokens";
import { prisma } from "@/lib/prisma";

const invalidInviteMessage = "This invite link is invalid or expired.";

type SetPasswordBody = {
  confirmPassword?: unknown;
  password?: unknown;
  token?: unknown;
};

function isSetPasswordBody(value: unknown): value is SetPasswordBody {
  return Boolean(value && typeof value === "object");
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);

  if (!isSetPasswordBody(body)) {
    return Response.json({ error: invalidInviteMessage }, { status: 400 });
  }

  const token = typeof body.token === "string" ? body.token.trim() : "";
  const password = typeof body.password === "string" ? body.password : "";
  const confirmPassword =
    typeof body.confirmPassword === "string" ? body.confirmPassword : "";

  if (!token) {
    return Response.json({ error: invalidInviteMessage }, { status: 400 });
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

  const invite = await findValidAccountAccessToken({
    rawToken: token,
    type: "DOCTOR_INVITE",
  });

  if (!invite || invite.user.role !== "DOCTOR") {
    return Response.json({ error: invalidInviteMessage }, { status: 400 });
  }

  const passwordHash = await hashPassword(password);
  const passwordChangedAt = new Date();

  const result = await prisma.$transaction(async (tx) => {
    const tokenUpdate = await tx.accountAccessToken.updateMany({
      where: {
        expiresAt: {
          gt: new Date(),
        },
        id: invite.id,
        type: "DOCTOR_INVITE",
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
        id: invite.userId,
      },
      data: {
        isActive: true,
        passwordChangedAt,
        passwordHash,
      },
    });

    await tx.session.updateMany({
      where: {
        revokedAt: null,
        userId: invite.userId,
      },
      data: {
        revokedAt: passwordChangedAt,
      },
    });

    const doctorProfile = await tx.doctorProfile.findUnique({
      where: {
        userId: invite.userId,
      },
      select: {
        id: true,
      },
    });

    await tx.auditLog.create({
      data: {
        action: "ACCOUNT_PASSWORD_SET",
        actorId: invite.userId,
        entityId: invite.userId,
        entityType: "User",
        metadata: {
          changedFields: ["passwordChangedAt", "isActive"],
          doctorProfileId: doctorProfile?.id ?? null,
          tokenType: "DOCTOR_INVITE",
          userId: invite.userId,
        },
      },
    });

    return { success: true };
  });

  if (!result.success) {
    return Response.json({ error: invalidInviteMessage }, { status: 400 });
  }

  return Response.json({
    redirectTo: "/login?passwordSet=1",
    success: true,
  });
}
