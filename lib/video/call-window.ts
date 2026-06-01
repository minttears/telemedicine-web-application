import type { ConsultationStatus } from "@prisma/client";

export const VIDEO_CALL_JOIN_WINDOW_BEFORE_MS = 15 * 60 * 1000;
export const VIDEO_CALL_JOIN_WINDOW_AFTER_MS = 90 * 60 * 1000;

const CALL_ENABLED_STATUSES: ConsultationStatus[] = ["SCHEDULED", "IN_PROGRESS"];

export function getVideoCallWindow(scheduledAt: Date) {
  return {
    closesAt: new Date(
      scheduledAt.getTime() + VIDEO_CALL_JOIN_WINDOW_AFTER_MS,
    ),
    opensAt: new Date(
      scheduledAt.getTime() - VIDEO_CALL_JOIN_WINDOW_BEFORE_MS,
    ),
  };
}

export function isWithinVideoCallWindow(scheduledAt: Date, now = new Date()) {
  const { closesAt, opensAt } = getVideoCallWindow(scheduledAt);

  return now >= opensAt && now <= closesAt;
}

export function getVideoCallAvailability({
  scheduledAt,
  status,
}: {
  scheduledAt: Date;
  status: ConsultationStatus;
}) {
  if (status === "COMPLETED") {
    return {
      isEligible: false,
      reason: "Completed consultations cannot start video calls.",
    };
  }

  if (status === "CANCELLED") {
    return {
      isEligible: false,
      reason: "Cancelled consultations cannot start video calls.",
    };
  }

  if (!CALL_ENABLED_STATUSES.includes(status)) {
    return {
      isEligible: false,
      reason: "Video calls are not available for this consultation status.",
    };
  }

  if (!isWithinVideoCallWindow(scheduledAt)) {
    return {
      isEligible: false,
      reason:
        "Video calls are available from 15 minutes before the scheduled time until 90 minutes after it.",
    };
  }

  return {
    isEligible: true,
    reason: undefined,
  };
}
