import { MessageType } from "@prisma/client";
import type { NextRequest } from "next/server";

import {
  ForbiddenError,
  requireRole,
  UnauthorizedError,
} from "@/lib/auth/current-user";
import { forbidden, unauthorized } from "@/lib/auth/responses";
import { prisma } from "@/lib/prisma";

const MAX_MESSAGE_LENGTH = 2000;

export function GET() {
  return Response.json(
    { error: "Messages are not implemented in Phase 1." },
    { status: 501 },
  );
}

function badRequest(message: string) {
  return Response.json({ error: message }, { status: 400 });
}

function notFound() {
  return Response.json({ error: "Consultation not found." }, { status: 404 });
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireRole("PATIENT", "DOCTOR");

    let payload: unknown;

    try {
      payload = await request.json();
    } catch {
      return badRequest("Invalid request body.");
    }

    if (!payload || typeof payload !== "object") {
      return badRequest("Invalid request body.");
    }

    const { consultationId, body } = payload as {
      body?: unknown;
      consultationId?: unknown;
    };

    if (typeof consultationId !== "string" || consultationId.trim() === "") {
      return badRequest("Consultation is required.");
    }

    if (typeof body !== "string") {
      return badRequest("Message text is required.");
    }

    const trimmedBody = body.trim();

    if (trimmedBody.length === 0) {
      return badRequest("Message text is required.");
    }

    if (trimmedBody.length > MAX_MESSAGE_LENGTH) {
      return badRequest(
        `Message text must be ${MAX_MESSAGE_LENGTH} characters or fewer.`,
      );
    }

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
        status: true,
      },
    });

    if (!consultation) {
      return notFound();
    }

    if (consultation.status === "COMPLETED") {
      return Response.json(
        { error: "Completed consultations are read-only." },
        { status: 409 },
      );
    }

    const message = await prisma.message.create({
      data: {
        body: trimmedBody,
        consultationId: consultation.id,
        senderId: user.id,
        type: MessageType.TEXT,
      },
      select: {
        id: true,
      },
    });

    return Response.json({ id: message.id });
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      return unauthorized();
    }

    if (error instanceof ForbiddenError) {
      return forbidden();
    }

    return Response.json({ error: "Unable to send message." }, { status: 500 });
  }
}
