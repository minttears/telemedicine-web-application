import { randomUUID } from "node:crypto";

import {
  AuditAction,
  ConsultationCallSessionStatus,
  ConsultationStatus,
  Prisma,
  type UserRole,
} from "@prisma/client";
import type { NextRequest } from "next/server";

import {
  ForbiddenError,
  requireRole,
  UnauthorizedError,
} from "@/lib/auth/current-user";
import { forbidden, unauthorized } from "@/lib/auth/responses";
import { prisma } from "@/lib/prisma";
import {
  getVideoCallWindow,
  isWithinVideoCallWindow,
  VIDEO_CALL_JOIN_WINDOW_AFTER_MS,
} from "@/lib/video/call-window";
import {
  createDailyMeetingToken,
  createDailyPrivateRoom,
} from "@/lib/video/daily";

const VIDEO_PROVIDER = "daily";
const ROOM_EXPIRY_BUFFER_MS = 15 * 60 * 1000;
const TOKEN_TTL_MS = 15 * 60 * 1000;
const CALL_ENABLED_STATUSES: ConsultationStatus[] = [
  ConsultationStatus.SCHEDULED,
  ConsultationStatus.IN_PROGRESS,
];

type CallSessionRouteContext = {
  params: Promise<{
    consultationId: string;
  }>;
};

function notFound() {
  return Response.json({ error: "Consultation not found." }, { status: 404 });
}

function conflict(message: string) {
  return Response.json({ error: message }, { status: 409 });
}

function unavailable(message: string) {
  return Response.json({ error: message }, { status: 503 });
}

function getParticipantName({
  role,
  userName,
}: {
  role: UserRole;
  userName: string | null;
}) {
  if (userName?.trim()) {
    return userName.trim();
  }

  return role === "DOCTOR" ? "Doctor" : "Patient";
}

async function findActiveCallSession(consultationId: string) {
  return prisma.consultationCallSession.findFirst({
    orderBy: {
      createdAt: "desc",
    },
    where: {
      consultationId,
      provider: VIDEO_PROVIDER,
      status: {
        in: [
          ConsultationCallSessionStatus.CREATED,
          ConsultationCallSessionStatus.ACTIVE,
        ],
      },
    },
  });
}

async function createCallSession({
  consultationId,
  createdByUserId,
  roomExpiresAt,
}: {
  consultationId: string;
  createdByUserId: string;
  roomExpiresAt: Date;
}) {
  const roomName = `tm-${randomUUID()}`;
  const room = await createDailyPrivateRoom({
    expiresAt: roomExpiresAt,
    roomName,
  });

  if (!room.ok) {
    return room;
  }

  try {
    const session = await prisma.consultationCallSession.create({
      data: {
        consultationId,
        createdByUserId,
        provider: VIDEO_PROVIDER,
        providerRoomName: room.data.name,
        providerRoomUrl: room.data.url,
        status: ConsultationCallSessionStatus.CREATED,
      },
    });

    await prisma.auditLog.create({
      data: {
        action: AuditAction.VIDEO_CALL_SESSION_CREATED,
        actorId: createdByUserId,
        entityId: session.id,
        entityType: "ConsultationCallSession",
        metadata: {
          action: "call_session_created",
          callSessionId: session.id,
          consultationId,
          provider: VIDEO_PROVIDER,
        },
      },
    });

    return { data: session, ok: true as const };
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      const existingSession = await findActiveCallSession(consultationId);

      if (existingSession) {
        return { data: existingSession, ok: true as const };
      }
    }

    throw error;
  }
}

export async function POST(
  _request: NextRequest,
  context: CallSessionRouteContext,
) {
  try {
    const user = await requireRole("PATIENT", "DOCTOR");
    const { consultationId } = await context.params;

    if (consultationId.trim() === "") {
      return notFound();
    }

    const now = new Date();
    const consultation = await prisma.consultation.findFirst({
      where: {
        id: consultationId,
        ...(user.role === "PATIENT"
          ? {
              patient: {
                userId: user.id,
              },
            }
          : {
              doctor: {
                userId: user.id,
              },
            }),
      },
      select: {
        id: true,
        scheduledAt: true,
        status: true,
      },
    });

    if (!consultation) {
      return notFound();
    }

    if (consultation.status === ConsultationStatus.COMPLETED) {
      return conflict("Completed consultations cannot start video calls.");
    }

    if (consultation.status === ConsultationStatus.CANCELLED) {
      return conflict("Cancelled consultations cannot start video calls.");
    }

    if (!CALL_ENABLED_STATUSES.includes(consultation.status)) {
      return conflict("Video calls are not available for this consultation status.");
    }

    if (!isWithinVideoCallWindow(consultation.scheduledAt, now)) {
      return conflict(
        "Video calls are available from 15 minutes before the scheduled time until 90 minutes after it.",
      );
    }

    const { closesAt } = getVideoCallWindow(consultation.scheduledAt);
    let callSession = await findActiveCallSession(consultation.id);

    if (!callSession) {
      const createdSession = await createCallSession({
        consultationId: consultation.id,
        createdByUserId: user.id,
        roomExpiresAt: new Date(closesAt.getTime() + ROOM_EXPIRY_BUFFER_MS),
      });

      if (!createdSession.ok) {
        return unavailable(createdSession.error);
      }

      callSession = createdSession.data;
    }

    if (user.role === "DOCTOR") {
      const [updatedSession] = await prisma.$transaction([
        prisma.consultationCallSession.update({
          data: {
            startedAt: callSession.startedAt ?? now,
            status: ConsultationCallSessionStatus.ACTIVE,
          },
          where: {
            id: callSession.id,
          },
        }),
        prisma.consultation.updateMany({
          data: {
            status: ConsultationStatus.IN_PROGRESS,
          },
          where: {
            id: consultation.id,
            status: ConsultationStatus.SCHEDULED,
          },
        }),
      ]);

      callSession = updatedSession;
    }

    const tokenExpiresAt = new Date(
      Math.min(
        now.getTime() + TOKEN_TTL_MS,
        consultation.scheduledAt.getTime() + VIDEO_CALL_JOIN_WINDOW_AFTER_MS,
      ),
    );
    const token = await createDailyMeetingToken({
      expiresAt: tokenExpiresAt,
      isOwner: user.role === "DOCTOR",
      roomName: callSession.providerRoomName,
      userId: user.id,
      userName: getParticipantName({ role: user.role, userName: user.name }),
    });

    if (!token.ok) {
      return unavailable(token.error);
    }

    await prisma.auditLog.create({
      data: {
        action: AuditAction.VIDEO_CALL_JOIN_TOKEN_CREATED,
        actorId: user.id,
        entityId: callSession.id,
        entityType: "ConsultationCallSession",
        metadata: {
          action: "call_join_token_created",
          callSessionId: callSession.id,
          consultationId: consultation.id,
          provider: VIDEO_PROVIDER,
          role: user.role,
        },
      },
    });

    return Response.json({
      callSessionId: callSession.id,
      meetingToken: token.data.token,
      provider: VIDEO_PROVIDER,
      roomName: callSession.providerRoomName,
      roomUrl: callSession.providerRoomUrl,
      sessionStatus: callSession.status,
      tokenExpiresAt: tokenExpiresAt.toISOString(),
    });
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      return unauthorized();
    }

    if (error instanceof ForbiddenError) {
      return forbidden();
    }

    return Response.json(
      { error: "Unable to create video call session." },
      { status: 500 },
    );
  }
}
