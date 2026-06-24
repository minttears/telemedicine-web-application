import {
  ForbiddenError,
  requireRole,
  UnauthorizedError,
} from "@/lib/auth/current-user";
import { forbidden, unauthorized } from "@/lib/auth/responses";
import { prisma } from "@/lib/prisma";

const invalidDoctorMessage = "Doctor not found.";
class TwoFactorNotEnabledError extends Error {}

type DoctorTwoFactorResetRouteContext = {
  params: Promise<{
    doctorId: string;
  }>;
};

export async function POST(
  _request: Request,
  { params }: DoctorTwoFactorResetRouteContext,
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
      user: {
        select: {
          twoFactorSecret: {
            select: {
              enabledAt: true,
              id: true,
            },
          },
        },
      },
    },
  });

  if (!doctor || doctor.userId === admin.id) {
    return Response.json({ error: invalidDoctorMessage }, { status: 404 });
  }

  if (!doctor.user.twoFactorSecret?.enabledAt) {
    return Response.json(
      { error: "Doctor two-factor authentication is not enabled." },
      { status: 409 },
    );
  }

  const resetAt = new Date();

  try {
    await prisma.$transaction(async (tx) => {
      const secretDelete = await tx.twoFactorSecret.deleteMany({
        where: {
          enabledAt: {
            not: null,
          },
          userId: doctor.userId,
        },
      });

      if (secretDelete.count !== 1) {
        throw new TwoFactorNotEnabledError();
      }

      await tx.twoFactorChallenge.deleteMany({
        where: {
          userId: doctor.userId,
        },
      });
      await tx.twoFactorRecoveryCode.deleteMany({
        where: {
          userId: doctor.userId,
        },
      });
      await tx.session.updateMany({
        where: {
          revokedAt: null,
          userId: doctor.userId,
        },
        data: {
          revokedAt: resetAt,
        },
      });
      await tx.auditLog.create({
        data: {
          action: "DOCTOR_UPDATED",
          actorId: admin.id,
          entityId: doctor.id,
          entityType: "DoctorProfile",
          metadata: {
            changedFields: ["twoFactorEnrollment"],
            doctorProfileId: doctor.id,
            sessionsRevoked: true,
            userId: doctor.userId,
          },
        },
      });
    });
  } catch (error) {
    if (error instanceof TwoFactorNotEnabledError) {
      return Response.json(
        { error: "Doctor two-factor authentication is not enabled." },
        { status: 409 },
      );
    }

    throw error;
  }

  return Response.json({
    success: true,
  });
}
