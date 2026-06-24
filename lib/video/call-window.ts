import type { ConsultationStatus } from "@prisma/client";

export const VIDEO_CALL_FALLBACK_DURATION_MS = 60 * 60 * 1000;

const CALL_ENABLED_STATUSES: ConsultationStatus[] = ["SCHEDULED", "IN_PROGRESS"];

export function getVideoCallWindow({
  endsAt,
  scheduledAt,
  startsAt,
}: {
  endsAt?: Date | null;
  scheduledAt: Date;
  startsAt?: Date | null;
}) {
  const opensAt = startsAt ?? scheduledAt;

  return {
    closesAt: endsAt ?? new Date(scheduledAt.getTime() + VIDEO_CALL_FALLBACK_DURATION_MS),
    opensAt,
  };
}

export function isWithinVideoCallWindow({
  endsAt,
  now = new Date(),
  scheduledAt,
  startsAt,
}: {
  endsAt?: Date | null;
  now?: Date;
  scheduledAt: Date;
  startsAt?: Date | null;
}) {
  const { closesAt, opensAt } = getVideoCallWindow({
    endsAt,
    scheduledAt,
    startsAt,
  });

  return now >= opensAt && now <= closesAt;
}

export function getVideoCallAvailability({
  endsAt,
  scheduledAt,
  startsAt,
  status,
}: {
  endsAt?: Date | null;
  scheduledAt: Date;
  startsAt?: Date | null;
  status: ConsultationStatus;
}) {
  if (status === "COMPLETED") {
    return {
      isEligible: false,
      reason: "Для завершённых консультаций видеозвонок недоступен.",
    };
  }

  if (status === "CANCELLED") {
    return {
      isEligible: false,
      reason: "Для отменённых консультаций видеозвонок недоступен.",
    };
  }

  if (!CALL_ENABLED_STATUSES.includes(status)) {
    return {
      isEligible: false,
      reason: "Видеозвонок недоступен при текущем статусе консультации.",
    };
  }

  if (
    !isWithinVideoCallWindow({
      endsAt,
      scheduledAt,
      startsAt,
    })
  ) {
    return {
      isEligible: false,
      reason:
        "Видеозвонок доступен с запланированного начала до окончания консультации.",
    };
  }

  return {
    isEligible: true,
    reason: undefined,
  };
}
