import { requireRole, UnauthorizedError, ForbiddenError } from "@/lib/auth/current-user";
import { forbidden, unauthorized } from "@/lib/auth/responses";
import { prisma } from "@/lib/prisma";

const slotUnavailableMessage = "This time is no longer available. Please choose another slot.";

function isBookingBody(value: unknown): value is {
  doctorId: string;
  scheduleSlotId: string;
} {
  if (!value || typeof value !== "object") {
    return false;
  }

  const body = value as Record<string, unknown>;

  return (
    typeof body.doctorId === "string" &&
    typeof body.scheduleSlotId === "string"
  );
}

function isUniqueConstraintError(error: unknown) {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    error.code === "P2002"
  );
}

export function GET() {
  return Response.json(
    { error: "Consultations are not implemented in Phase 1." },
    { status: 501 },
  );
}

export async function POST(request: Request) {
  let user;

  try {
    user = await requireRole("PATIENT");
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      return unauthorized();
    }

    if (error instanceof ForbiddenError) {
      return forbidden();
    }

    throw error;
  }

  const body = await request.json().catch(() => null);

  if (!isBookingBody(body)) {
    return Response.json({ error: "Invalid booking details." }, { status: 400 });
  }

  const doctorId = body.doctorId.trim();
  const scheduleSlotId = body.scheduleSlotId.trim();

  if (!doctorId || !scheduleSlotId) {
    return Response.json({ error: "Invalid booking details." }, { status: 400 });
  }

  try {
    const consultation = await prisma.$transaction(async (tx) => {
      const patientProfile = await tx.patientProfile.findUnique({
        where: {
          userId: user.id,
        },
        select: {
          id: true,
        },
      });

      if (!patientProfile) {
        throw new Error("PATIENT_PROFILE_MISSING");
      }

      const updatedSlot = await tx.doctorScheduleSlot.updateMany({
        where: {
          id: scheduleSlotId,
          doctorId,
          startsAt: {
            gt: new Date(),
          },
          status: "AVAILABLE",
          doctor: {
            user: {
              isActive: true,
              role: "DOCTOR",
            },
          },
        },
        data: {
          status: "BOOKED",
        },
      });

      if (updatedSlot.count !== 1) {
        throw new Error("SLOT_UNAVAILABLE");
      }

      const slot = await tx.doctorScheduleSlot.findUnique({
        where: {
          id: scheduleSlotId,
        },
        select: {
          startsAt: true,
        },
      });

      if (!slot) {
        throw new Error("SLOT_UNAVAILABLE");
      }

      return tx.consultation.create({
        data: {
          patientId: patientProfile.id,
          doctorId,
          scheduleSlotId,
          scheduledAt: slot.startsAt,
          status: "SCHEDULED",
        },
        select: {
          id: true,
        },
      });
    });

    return Response.json(
      {
        consultationId: consultation.id,
        redirectTo: `/patient/consultations/${consultation.id}`,
      },
      { status: 201 },
    );
  } catch (error) {
    if (error instanceof Error && error.message === "PATIENT_PROFILE_MISSING") {
      return Response.json(
        { error: "Patient profile is required before booking." },
        { status: 400 },
      );
    }

    if (
      (error instanceof Error && error.message === "SLOT_UNAVAILABLE") ||
      isUniqueConstraintError(error)
    ) {
      return Response.json({ error: slotUnavailableMessage }, { status: 409 });
    }

    throw error;
  }
}
