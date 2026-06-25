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
const diagnosisStatuses = new Set<string>([
  ConsultationDiagnosisStatus.NOT_IDENTIFIED,
  ConsultationDiagnosisStatus.REQUIRES_FURTHER_EXAMINATION,
  ConsultationDiagnosisStatus.PRELIMINARY,
  ConsultationDiagnosisStatus.CONFIRMED,
  ConsultationDiagnosisStatus.CANNOT_DETERMINE_ONLINE,
]);

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
  return Response.json({ error: "Консультация не найдена." }, { status: 404 });
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
    return { error: `${fieldLabel}: требуется текстовое значение.` };
  }

  const trimmedValue = value.trim();

  if (trimmedValue.length > maxLength) {
    return { error: `${fieldLabel}: не более ${maxLength} символов.` };
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
      return badRequest("Некорректные данные запроса.");
    }

    if (!payload || typeof payload !== "object") {
      return badRequest("Некорректные данные запроса.");
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
      return badRequest("Добавьте заключение по консультации.");
    }

    const trimmedDoctorNotes = doctorNotes.trim();

    if (trimmedDoctorNotes.length === 0) {
      return badRequest("Добавьте заключение по консультации.");
    }

    if (trimmedDoctorNotes.length > MAX_DOCTOR_NOTES_LENGTH) {
      return badRequest(
        `Заключение должно содержать не более ${MAX_DOCTOR_NOTES_LENGTH} символов.`,
      );
    }

    if (
      typeof diagnosisStatus !== "string" ||
      !diagnosisStatuses.has(diagnosisStatus)
    ) {
      return badRequest("Выберите корректный статус диагноза.");
    }

    const trimmedDiagnosisDetails = optionalTextField(
      diagnosisDetails,
      "Сведения о диагнозе",
      MAX_SHORT_OUTCOME_FIELD_LENGTH,
    );
    const trimmedRecommendations = optionalTextField(
      recommendations,
      "Рекомендации",
      MAX_LONG_OUTCOME_FIELD_LENGTH,
    );
    const trimmedMedicationNotes = optionalTextField(
      medicationNotes,
      "Рекомендации по лекарствам",
      MAX_SHORT_OUTCOME_FIELD_LENGTH,
    );
    const trimmedFollowUpInstructions = optionalTextField(
      followUpInstructions,
      "Последующее наблюдение",
      MAX_SHORT_OUTCOME_FIELD_LENGTH,
    );
    const trimmedAdditionalNotes = optionalTextField(
      additionalNotes,
      "Дополнительные заметки",
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
      return conflict("Консультация уже завершена.");
    }

    if (consultation.status === "CANCELLED") {
      return conflict("Отменённую консультацию нельзя завершить.");
    }

    if (!completableStatuses.includes(consultation.status)) {
      return conflict(
        "Консультацию нельзя завершить при текущем статусе.",
      );
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
      return conflict("Не удалось завершить консультацию.");
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

    if (process.env.NODE_ENV !== "production") {
      console.error("Unable to complete consultation", error);
    }

    return Response.json(
      {
        error:
          process.env.NODE_ENV === "production"
            ? "Не удалось завершить консультацию."
            : error instanceof Error
              ? error.message
              : "Не удалось завершить консультацию.",
      },
      { status: 500 },
    );
  }
}
