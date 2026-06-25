import {
  ForbiddenError,
  requireRole,
  UnauthorizedError,
} from "@/lib/auth/current-user";
import { forbidden, unauthorized } from "@/lib/auth/responses";
import { prisma } from "@/lib/prisma";

const QA_SLOT_DURATION_MS = 30 * 60 * 1000;

function unavailableInProduction() {
  return Response.json({ error: "Не найдено." }, { status: 404 });
}

function badRequest(message: string) {
  return Response.json({ error: message }, { status: 400 });
}

function conflict(message: string) {
  return Response.json({ error: message }, { status: 409 });
}

function getStartOffsetMinutes(value: unknown) {
  if (value === "now") {
    return 0;
  }

  if (typeof value !== "number" || !Number.isFinite(value)) {
    return 5;
  }

  if (value !== 0 && value !== 5) {
    return 5;
  }

  return value;
}

export async function POST(request: Request) {
  if (process.env.NODE_ENV === "production") {
    return unavailableInProduction();
  }

  try {
    const user = await requireRole("DOCTOR");
    const body = (await request.json().catch(() => null)) as {
      startOffsetMinutes?: unknown;
    } | null;
    const startOffsetMinutes = getStartOffsetMinutes(body?.startOffsetMinutes);
    const now = new Date();
    const startsAt = new Date(now.getTime() + startOffsetMinutes * 60 * 1000);
    const endsAt = new Date(startsAt.getTime() + QA_SLOT_DURATION_MS);

    const doctorProfile = await prisma.doctorProfile.findUnique({
      where: {
        userId: user.id,
      },
      select: {
        id: true,
      },
    });

    if (!doctorProfile) {
      return badRequest(
        "Для создания тестовой консультации требуется профиль врача.",
      );
    }

    const patientProfile = await prisma.patientProfile.findFirst({
      orderBy: {
        createdAt: "asc",
      },
      select: {
        id: true,
      },
      where: {
        user: {
          isActive: true,
          role: "PATIENT",
        },
      },
    });

    if (!patientProfile) {
      return conflict(
        "Для тестовой консультации требуется активный профиль пациента.",
      );
    }

    const consultation = await prisma.$transaction(async (tx) => {
      const overlappingSlot = await tx.doctorScheduleSlot.findFirst({
        select: {
          id: true,
        },
        where: {
          doctorId: doctorProfile.id,
          endsAt: {
            gt: startsAt,
          },
          startsAt: {
            lt: endsAt,
          },
          status: {
            in: ["AVAILABLE", "BOOKED", "BLOCKED"],
          },
        },
      });

      if (overlappingSlot) {
        throw new Error("SLOT_OVERLAP");
      }

      const slot = await tx.doctorScheduleSlot.create({
        data: {
          doctorId: doctorProfile.id,
          endsAt,
          startsAt,
          status: "BOOKED",
        },
        select: {
          id: true,
        },
      });

      return tx.consultation.create({
        data: {
          description:
            "Демонстрационная консультация для проверки видеосвязи. Не использовать для реальной медицинской помощи.",
          doctorId: doctorProfile.id,
          patientId: patientProfile.id,
          scheduleSlotId: slot.id,
          scheduledAt: startsAt,
          status: "SCHEDULED",
          subject: "Проверка видеосвязи в среде разработки",
        },
        select: {
          id: true,
        },
      });
    });

    return Response.json(
      {
        consultationId: consultation.id,
        redirectTo: `/doctor/consultations/${consultation.id}`,
      },
      { status: 201 },
    );
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      return unauthorized();
    }

    if (error instanceof ForbiddenError) {
      return forbidden();
    }

    if (error instanceof Error && error.message === "SLOT_OVERLAP") {
      return conflict(
        "Выбранное тестовое время пересекается с существующим слотом.",
      );
    }

    return Response.json(
      {
        error:
          "Не удалось создать тестовую консультацию для проверки видеозвонка.",
      },
      { status: 500 },
    );
  }
}
