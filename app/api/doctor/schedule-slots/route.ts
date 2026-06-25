import { Prisma, ScheduleSlotStatus } from "@prisma/client";

import {
  ForbiddenError,
  requireRole,
  UnauthorizedError,
} from "@/lib/auth/current-user";
import { forbidden, unauthorized } from "@/lib/auth/responses";
import { getMinimumBookingStartsAt } from "@/lib/booking-lead-time";
import { prisma } from "@/lib/prisma";

const MIN_SLOT_DURATION_MS = 15 * 60 * 1000;
const MAX_SLOT_DURATION_MS = 4 * 60 * 60 * 1000;
const overlapStatuses: ScheduleSlotStatus[] = [
  "AVAILABLE",
  "BOOKED",
  "BLOCKED",
];

function badRequest(message: string) {
  return Response.json({ error: message }, { status: 400 });
}

function conflict(message: string) {
  return Response.json({ error: message }, { status: 409 });
}

function parseDate(value: unknown) {
  if (typeof value !== "string" || value.trim() === "") {
    return null;
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return date;
}

function isUniqueConstraintError(error: unknown) {
  return (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    error.code === "P2002"
  );
}

async function getCurrentDoctorProfileId(userId: string) {
  const doctorProfile = await prisma.doctorProfile.findUnique({
    where: {
      userId,
    },
    select: {
      id: true,
    },
  });

  return doctorProfile?.id ?? null;
}

async function handleAuthError(error: unknown) {
  if (error instanceof UnauthorizedError) {
    return unauthorized();
  }

  if (error instanceof ForbiddenError) {
    return forbidden();
  }

  return null;
}

export async function POST(request: Request) {
  try {
    const user = await requireRole("DOCTOR");
    const doctorId = await getCurrentDoctorProfileId(user.id);

    if (!doctorId) {
      return badRequest("Для управления расписанием требуется профиль врача.");
    }

    const body = (await request.json().catch(() => null)) as {
      endsAt?: unknown;
      startsAt?: unknown;
    } | null;

    const startsAt = parseDate(body?.startsAt);
    const endsAt = parseDate(body?.endsAt);

    if (!startsAt || !endsAt) {
      return badRequest("Укажите время начала и окончания.");
    }

    const minimumStartsAt = getMinimumBookingStartsAt();

    if (startsAt < minimumStartsAt) {
      return badRequest(
        "Время приёма должно начинаться не ранее чем через 5 минут.",
      );
    }

    if (endsAt <= startsAt) {
      return badRequest("Время окончания должно быть позже времени начала.");
    }

    const durationMs = endsAt.getTime() - startsAt.getTime();

    if (durationMs < MIN_SLOT_DURATION_MS) {
      return badRequest("Продолжительность должна быть не менее 15 минут.");
    }

    if (durationMs > MAX_SLOT_DURATION_MS) {
      return badRequest("Продолжительность не может превышать 4 часа.");
    }

    const slot = await prisma.$transaction(async (tx) => {
      const overlappingSlot = await tx.doctorScheduleSlot.findFirst({
        where: {
          doctorId,
          endsAt: {
            gt: startsAt,
          },
          startsAt: {
            lt: endsAt,
          },
          status: {
            in: overlapStatuses,
          },
        },
        select: {
          id: true,
        },
      });

      if (overlappingSlot) {
        throw new Error("SLOT_OVERLAP");
      }

      return tx.doctorScheduleSlot.create({
        data: {
          doctorId,
          endsAt,
          startsAt,
          status: "AVAILABLE",
        },
        select: {
          id: true,
        },
      });
    });

    return Response.json({ id: slot.id }, { status: 201 });
  } catch (error) {
    const authResponse = await handleAuthError(error);

    if (authResponse) {
      return authResponse;
    }

    if (
      (error instanceof Error && error.message === "SLOT_OVERLAP") ||
      isUniqueConstraintError(error)
    ) {
      return conflict("Этот интервал расписания пересекается с существующим.");
    }

    return Response.json(
      { error: "Не удалось добавить доступное время." },
      { status: 500 },
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const user = await requireRole("DOCTOR");
    const doctorId = await getCurrentDoctorProfileId(user.id);

    if (!doctorId) {
      return badRequest("Для управления расписанием требуется профиль врача.");
    }

    const body = (await request.json().catch(() => null)) as {
      action?: unknown;
      slotId?: unknown;
    } | null;

    if (body?.action !== "cancel") {
      return badRequest("Некорректное действие с интервалом расписания.");
    }

    if (typeof body.slotId !== "string" || body.slotId.trim() === "") {
      return badRequest("Укажите интервал расписания.");
    }

    const updatedSlot = await prisma.doctorScheduleSlot.updateMany({
      where: {
        doctorId,
        id: body.slotId.trim(),
        startsAt: {
          gt: new Date(),
        },
        status: "AVAILABLE",
      },
      data: {
        status: "CANCELLED",
      },
    });

    if (updatedSlot.count !== 1) {
      return conflict("Этот интервал расписания нельзя отменить.");
    }

    return Response.json({ ok: true });
  } catch (error) {
    const authResponse = await handleAuthError(error);

    if (authResponse) {
      return authResponse;
    }

    return Response.json(
      { error: "Не удалось обновить интервал расписания." },
      { status: 500 },
    );
  }
}
