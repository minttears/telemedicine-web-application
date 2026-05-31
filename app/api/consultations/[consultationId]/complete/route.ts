import {
  ConsultationDiagnosisStatus,
  type ConsultationStatus,
} from "@prisma/client";
import type { NextRequest } from "next/server";

import {
  ForbiddenError,
  requireRole,
  UnauthorizedError,
} from "@/lib/auth/current-user";
import { forbidden, unauthorized } from "@/lib/auth/responses";
import { prisma } from "@/lib/prisma";

const MAX_DOCTOR_NOTES_LENGTH = 4000;
const MAX_LONG_OUTCOME_FIELD_LENGTH = 4000;
const MAX_SHORT_OUTCOME_FIELD_LENGTH = 2000;
const completableStatuses: ConsultationStatus[] = ["SCHEDULED", "IN_PROGRESS"];
const diagnosisStatuses = new Set<string>(
  Object.values(ConsultationDiagnosisStatus),
);

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

function optionalTextField(
  value: unknown,
  fieldLabel: string,
  maxLength: number,
) {
  if (value === undefined || value === null) {
    return { value: null };
  }

  if (typeof value !== "string") {
    return { error: `${fieldLabel} must be text.` };
  }

  const trimmedValue = value.trim();

  if (trimmedValue.length > maxLength) {
    return { error: `${fieldLabel} must be ${maxLength} characters or fewer.` };
  }

  return { value: trimmedValue.length > 0 ? trimmedValue : null };
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

    const {
      additionalNotes,
      diagnosisDetails,
      diagnosisStatus,
      doctorNotes,
      followUpInstructions,
      medicationNotes,
      recommendations,
    } = payload as {
      additionalNotes?: unknown;
      diagnosisDetails?: unknown;
      diagnosisStatus?: unknown;
      doctorNotes?: unknown;
      followUpInstructions?: unknown;
      medicationNotes?: unknown;
      recommendations?: unknown;
    };

    if (typeof doctorNotes !== "string") {
      return badRequest("Conclusion / summary is required.");
    }

    const trimmedDoctorNotes = doctorNotes.trim();

    if (trimmedDoctorNotes.length === 0) {
      return badRequest("Conclusion / summary is required.");
    }

    if (trimmedDoctorNotes.length > MAX_DOCTOR_NOTES_LENGTH) {
      return badRequest(
        `Conclusion / summary must be ${MAX_DOCTOR_NOTES_LENGTH} characters or fewer.`,
      );
    }

    if (
      typeof diagnosisStatus !== "string" ||
      !diagnosisStatuses.has(diagnosisStatus)
    ) {
      return badRequest("Select a valid diagnosis status.");
    }

    const trimmedDiagnosisDetails = optionalTextField(
      diagnosisDetails,
      "Diagnosis details",
      MAX_SHORT_OUTCOME_FIELD_LENGTH,
    );
    const trimmedRecommendations = optionalTextField(
      recommendations,
      "Doctor recommendations",
      MAX_LONG_OUTCOME_FIELD_LENGTH,
    );
    const trimmedMedicationNotes = optionalTextField(
      medicationNotes,
      "Medication notes",
      MAX_SHORT_OUTCOME_FIELD_LENGTH,
    );
    const trimmedFollowUpInstructions = optionalTextField(
      followUpInstructions,
      "Follow-up instructions",
      MAX_SHORT_OUTCOME_FIELD_LENGTH,
    );
    const trimmedAdditionalNotes = optionalTextField(
      additionalNotes,
      "Additional notes",
      MAX_SHORT_OUTCOME_FIELD_LENGTH,
    );

    for (const result of [
      trimmedDiagnosisDetails,
      trimmedRecommendations,
      trimmedMedicationNotes,
      trimmedFollowUpInstructions,
      trimmedAdditionalNotes,
    ]) {
      if (result.error) {
        return badRequest(result.error);
      }
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
        additionalNotes: trimmedAdditionalNotes.value,
        completedAt,
        diagnosisDetails: trimmedDiagnosisDetails.value,
        diagnosisStatus: diagnosisStatus as ConsultationDiagnosisStatus,
        doctorNotes: trimmedDoctorNotes,
        followUpInstructions: trimmedFollowUpInstructions.value,
        medicationNotes: trimmedMedicationNotes.value,
        recommendations: trimmedRecommendations.value,
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
