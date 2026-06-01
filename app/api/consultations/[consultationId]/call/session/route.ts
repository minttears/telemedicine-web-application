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
} from "@/lib/video/call-window";
import { createLiveKitParticipantToken } from "@/lib/video/livekit";

const VIDEO_PROVIDER = "livekit";
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
}: {
  consultationId: string;
  createdByUserId: string;
}) {
  const roomName = `tm-${randomUUID()}`;

  try {
    const session = await prisma.consultationCallSession.create({
      data: {
        consultationId,
        createdByUserId,
        provider: VIDEO_PROVIDER,
        providerRoomName: roomName,
        providerRoomUrl: null,
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

    return session;
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      const existingSession = await findActiveCallSession(consultationId);

      if (existingSession) {
        return existingSession;
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
        scheduleSlot: {
          select: {
            endsAt: true,
            startsAt: true,
          },
        },
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

    if (
      !isWithinVideoCallWindow({
        endsAt: consultation.scheduleSlot?.endsAt,
        now,
        scheduledAt: consultation.scheduledAt,
        startsAt: consultation.scheduleSlot?.startsAt,
      })
    ) {
      return conflict(
        "Video calls are available from the scheduled start time until the consultation end time.",
      );
    }

    const { closesAt } = getVideoCallWindow({
      endsAt: consultation.scheduleSlot?.endsAt,
      scheduledAt: consultation.scheduledAt,
      startsAt: consultation.scheduleSlot?.startsAt,
    });
    let callSession = await findActiveCallSession(consultation.id);

    if (!callSession) {
      callSession = await createCallSession({
        consultationId: consultation.id,
        createdByUserId: user.id,
      });
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
        closesAt.getTime(),
      ),
    );
    const token = await createLiveKitParticipantToken({
      expiresAt: tokenExpiresAt,
      roomName: callSession.providerRoomName,
      userId: user.id,
      userName: getParticipantName({ role: user.role, userName: user.name }),
      userRole: user.role,
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
      livekitUrl: token.data.url,
      participantToken: token.data.token,
      provider: VIDEO_PROVIDER,
      roomName: callSession.providerRoomName,
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
