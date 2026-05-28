import type { ConsultationStatus } from "@prisma/client";
import type { NextRequest } from "next/server";

import {
  ForbiddenError,
  requireRole,
  UnauthorizedError,
} from "@/lib/auth/current-user";
import { forbidden, unauthorized } from "@/lib/auth/responses";
import { prisma } from "@/lib/prisma";

const MAX_DOCTOR_NOTES_LENGTH = 4000;
const completableStatuses: ConsultationStatus[] = ["SCHEDULED", "IN_PROGRESS"];

type CompleteConsultationRouteContext = {
  params: Promise<{
    consultationId: string;
  }>;
};

function badRequest(message: string) {
  return Response.json({ error: message }, { status: 400 });
}

function conflict(message: string) {
  return Response.json({ error: message }, { status: 409 });
}

function notFound() {
  return Response.json({ error: "Consultation not found." }, { status: 404 });
}

export async function POST(
  request: NextRequest,
  { params }: CompleteConsultationRouteContext,
) {
  try {
    const user = await requireRole("DOCTOR");
    const { consultationId } = await params;

    if (consultationId.trim() === "") {
      return notFound();
    }

    let payload: unknown;

    try {
      payload = await request.json();
    } catch {
      return badRequest("Invalid request body.");
    }

    if (!payload || typeof payload !== "object") {
      return badRequest("Invalid request body.");
    }

    const { doctorNotes } = payload as {
      doctorNotes?: unknown;
    };

    if (typeof doctorNotes !== "string") {
      return badRequest("Conclusion and recommendations are required.");
    }

    const trimmedDoctorNotes = doctorNotes.trim();

    if (trimmedDoctorNotes.length === 0) {
      return badRequest("Conclusion and recommendations are required.");
    }

    if (trimmedDoctorNotes.length > MAX_DOCTOR_NOTES_LENGTH) {
      return badRequest(
        `Conclusion and recommendations must be ${MAX_DOCTOR_NOTES_LENGTH} characters or fewer.`,
      );
    }

    const consultation = await prisma.consultation.findFirst({
      where: {
        id: consultationId,
        doctor: {
          userId: user.id,
        },
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
      return conflict("Consultation is already completed.");
    }

    if (consultation.status === "CANCELLED") {
      return conflict("Cancelled consultations cannot be completed.");
    }

    if (!completableStatuses.includes(consultation.status)) {
      return conflict("Consultation cannot be completed from its current status.");
    }

    const completedAt = new Date();
    const updatedConsultation = await prisma.consultation.updateMany({
      where: {
        id: consultation.id,
        doctor: {
          userId: user.id,
        },
        status: {
          in: completableStatuses,
        },
      },
      data: {
        completedAt,
        doctorNotes: trimmedDoctorNotes,
        status: "COMPLETED",
      },
    });

    if (updatedConsultation.count !== 1) {
      return conflict("Consultation could not be completed.");
    }

    return Response.json({
      completedAt: completedAt.toISOString(),
      consultationId: consultation.id,
      status: "COMPLETED",
    });
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      return unauthorized();
    }

    if (error instanceof ForbiddenError) {
      return forbidden();
    }

    return Response.json(
      { error: "Unable to complete consultation." },
      { status: 500 },
    );
  }
}
