import {
  ForbiddenError,
  requireRole,
  UnauthorizedError,
} from "@/lib/auth/current-user";
import {
  createRawAccountAccessToken,
  hashAccountAccessToken,
} from "@/lib/auth/access-tokens";
import { forbidden, unauthorized } from "@/lib/auth/responses";
import { prisma } from "@/lib/prisma";

const DOCTOR_INVITE_EXPIRATION_DAYS = 7;
const invalidDoctorMessage = "Врач не найден.";
const setupCompletedMessage =
  "Настройка аккаунта врача уже завершена. Используйте сброс пароля.";

type DoctorInviteRouteContext = {
  params: Promise<{
    doctorId: string;
  }>;
};

function getInviteExpiresAt() {
  return new Date(Date.now() + DOCTOR_INVITE_EXPIRATION_DAYS * 24 * 60 * 60 * 1000);
}

function buildInviteUrl(request: Request, rawToken: string) {
  const url = new URL("/set-password", request.url);
  url.searchParams.set("token", rawToken);
  return url.toString();
}

function canGenerateOnboardingInvite(doctor: {
  user: {
    isActive: boolean;
    passwordChangedAt: Date | null;
  };
}) {
  return doctor.user.passwordChangedAt === null && !doctor.user.isActive;
}

export async function POST(
  request: Request,
  { params }: DoctorInviteRouteContext,
) {
  let admin;

  try {
    admin = await requireRole("ADMIN");
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      return unauthorized();
    }

    if (error instanceof ForbiddenError) {
      return forbidden();
    }

    throw error;
  }

  const { doctorId } = await params;

  if (!doctorId.trim()) {
    return Response.json({ error: invalidDoctorMessage }, { status: 404 });
  }

  const doctor = await prisma.doctorProfile.findFirst({
    where: {
      id: doctorId,
      user: {
        role: "DOCTOR",
      },
    },
    select: {
      id: true,
      user: {
        select: {
          isActive: true,
          passwordChangedAt: true,
        },
      },
      userId: true,
    },
  });

  if (!doctor) {
    return Response.json({ error: invalidDoctorMessage }, { status: 404 });
  }

  if (!canGenerateOnboardingInvite(doctor)) {
    await prisma.accountAccessToken.updateMany({
      where: {
        expiresAt: {
          gt: new Date(),
        },
        type: "DOCTOR_INVITE",
        usedAt: null,
        userId: doctor.userId,
      },
      data: {
        usedAt: new Date(),
      },
    });

    return Response.json({ error: setupCompletedMessage }, { status: 409 });
  }

  const rawToken = createRawAccountAccessToken();
  const expiresAt = getInviteExpiresAt();

  await prisma.$transaction(async (tx) => {
    await tx.accountAccessToken.updateMany({
      where: {
        expiresAt: {
          gt: new Date(),
        },
        type: "DOCTOR_INVITE",
        usedAt: null,
        userId: doctor.userId,
      },
      data: {
        usedAt: new Date(),
      },
    });

    await tx.accountAccessToken.create({
      data: {
        createdById: admin.id,
        expiresAt,
        tokenHash: hashAccountAccessToken(rawToken),
        type: "DOCTOR_INVITE",
        userId: doctor.userId,
      },
    });

    await tx.auditLog.create({
      data: {
        action: "DOCTOR_INVITE_CREATED",
        actorId: admin.id,
        entityId: doctor.id,
        entityType: "DoctorProfile",
        metadata: {
          changedFields: ["accountAccessToken"],
          doctorProfileId: doctor.id,
          expiresAt: expiresAt.toISOString(),
          tokenType: "DOCTOR_INVITE",
          userId: doctor.userId,
        },
      },
    });
  });

  return Response.json({
    doctorId: doctor.id,
    inviteExpiresAt: expiresAt.toISOString(),
    inviteUrl: buildInviteUrl(request, rawToken),
  });
}
