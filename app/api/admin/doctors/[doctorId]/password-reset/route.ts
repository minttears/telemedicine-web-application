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

const PASSWORD_RESET_EXPIRATION_HOURS = 1;
const invalidDoctorMessage = "Врач не найден.";

type DoctorPasswordResetRouteContext = {
  params: Promise<{
    doctorId: string;
  }>;
};

function getResetExpiresAt() {
  return new Date(Date.now() + PASSWORD_RESET_EXPIRATION_HOURS * 60 * 60 * 1000);
}

function buildResetUrl(request: Request, rawToken: string) {
  const url = new URL("/reset-password", request.url);
  url.searchParams.set("token", rawToken);
  return url.toString();
}

export async function POST(
  request: Request,
  { params }: DoctorPasswordResetRouteContext,
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
      userId: true,
    },
  });

  if (!doctor) {
    return Response.json({ error: invalidDoctorMessage }, { status: 404 });
  }

  const rawToken = createRawAccountAccessToken();
  const expiresAt = getResetExpiresAt();

  await prisma.$transaction(async (tx) => {
    await tx.accountAccessToken.updateMany({
      where: {
        expiresAt: {
          gt: new Date(),
        },
        type: "PASSWORD_RESET",
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
        type: "PASSWORD_RESET",
        userId: doctor.userId,
      },
    });

    await tx.auditLog.create({
      data: {
        action: "PASSWORD_RESET_CREATED",
        actorId: admin.id,
        entityId: doctor.id,
        entityType: "DoctorProfile",
        metadata: {
          changedFields: ["accountAccessToken"],
          doctorProfileId: doctor.id,
          expiresAt: expiresAt.toISOString(),
          tokenType: "PASSWORD_RESET",
          userId: doctor.userId,
        },
      },
    });
  });

  return Response.json({
    doctorId: doctor.id,
    resetExpiresAt: expiresAt.toISOString(),
    resetUrl: buildResetUrl(request, rawToken),
  });
}
