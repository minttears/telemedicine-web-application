import Link from "next/link";
import { notFound } from "next/navigation";
import { MessageType } from "@prisma/client";

import {
  ConsultationSummaryPanel,
  ConsultationStatusBadge,
  ConsultationMessagesPanel,
} from "@/components/consultations/consultation-display";
import { ConsultationCompletionForm } from "@/components/consultations/consultation-completion-form";
import { VideoCallPanel } from "@/components/consultations/video-call-panel";
import { requireWorkspaceRole } from "@/lib/auth/workspace";
import { prisma } from "@/lib/prisma";
import { getVideoCallAvailability } from "@/lib/video/call-window";

type DoctorConsultationPageProps = {
  params: Promise<{
    consultationId: string;
  }>;
};

function formatDateTime(value: Date) {
  return new Intl.DateTimeFormat("ru-RU", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(value);
}

function formatDate(value: Date | null) {
  if (!value) {
    return "Не указано";
  }

  return new Intl.DateTimeFormat("ru-RU", {
    dateStyle: "medium",
  }).format(value);
}

function DetailItem({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div>
      <dt className="font-medium text-slate-700">{label}</dt>
      <dd className="mt-1 text-slate-600">{value}</dd>
    </div>
  );
}

export default async function DoctorConsultationPage({
  params,
}: DoctorConsultationPageProps) {
  const [{ consultationId }, user] = await Promise.all([
    params,
    requireWorkspaceRole("DOCTOR"),
  ]);

  const consultation = await prisma.consultation.findFirst({
    where: {
      id: consultationId,
      doctor: {
        userId: user.id,
      },
    },
    include: {
      doctor: {
        include: {
          specialty: true,
        },
      },
      patient: {
        include: {
          user: {
            select: {
              name: true,
            },
          },
        },
      },
      scheduleSlot: true,
      messages: {
        where: {
          type: {
            in: [MessageType.TEXT, MessageType.FILE],
          },
        },
        orderBy: {
          createdAt: "asc",
        },
        select: {
          attachments: {
            select: {
              createdAt: true,
              fileName: true,
              fileSize: true,
              fileType: true,
              id: true,
              uploadedBy: {
                select: {
                  name: true,
                  role: true,
                },
              },
            },
          },
          body: true,
          createdAt: true,
          id: true,
          sender: {
            select: {
              avatarStoragePath: true,
              doctorProfile: {
                select: {
                  id: true,
                  photoStoragePath: true,
                },
              },
              id: true,
              name: true,
              role: true,
            },
          },
          type: true,
        },
      },
    },
  });

  if (!consultation) {
    notFound();
  }

  const completedDoctorNotes = consultation.doctorNotes?.trim() ?? "";
  const videoCallAvailability = getVideoCallAvailability({
    endsAt: consultation.scheduleSlot?.endsAt,
    scheduledAt: consultation.scheduledAt,
    startsAt: consultation.scheduleSlot?.startsAt,
    status: consultation.status,
  });

  return (
    <div className="space-y-6">
      <Link
        className="inline-flex min-h-10 items-center rounded-md border border-slate-300 bg-white px-3 text-sm font-medium text-slate-700 transition hover:border-teal-700 hover:text-teal-700"
        href="/doctor/consultations"
      >
        Вернуться к консультациям
      </Link>

      <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-sm font-medium text-teal-700">
              {consultation.doctor.specialty?.name ??
                "Специальность не назначена"}
            </p>
            <h1 className="mt-3 text-3xl font-semibold tracking-normal text-slate-950">
              {consultation.patient.user.name ?? "Профиль пациента"}
            </h1>
            <p className="mt-2 text-base text-slate-600">
              Время консультации: {formatDateTime(consultation.scheduledAt)}
            </p>
          </div>
          <ConsultationStatusBadge status={consultation.status} />
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-[1fr_320px]">
        <div className="space-y-4">
          <VideoCallPanel
            callHref={`/doctor/consultations/${consultation.id}/call`}
            disabledReason={videoCallAvailability.reason}
            isEligible={videoCallAvailability.isEligible}
            role="DOCTOR"
          />
          {consultation.status === "COMPLETED" ? (
            <ConsultationSummaryPanel
              additionalNotes={consultation.additionalNotes}
              completedAt={consultation.completedAt}
              diagnosisDetails={consultation.diagnosisDetails}
              diagnosisStatus={consultation.diagnosisStatus}
              doctorNotes={
                completedDoctorNotes || "Итоговое заключение не добавлено."
              }
              followUpInstructions={consultation.followUpInstructions}
              medicationNotes={consultation.medicationNotes}
              recommendations={consultation.recommendations}
              title="Итоговое заключение"
            />
          ) : (
            <ConsultationCompletionForm consultationId={consultation.id} />
          )}
          <ConsultationMessagesPanel
            consultationId={consultation.id}
            currentUserId={user.id}
            messages={consultation.messages}
            readOnly={consultation.status === "COMPLETED"}
          />
        </div>

        <aside className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-medium text-teal-700">
            Информация о консультации
          </p>
          <dl className="mt-5 grid gap-4 text-sm">
            <DetailItem
              label="Время приёма"
              value={formatDateTime(consultation.scheduledAt)}
            />
            <DetailItem
              label="Статус консультации"
              value={
                {
                  CANCELLED: "Отменена",
                  COMPLETED: "Завершена",
                  IN_PROGRESS: "Идёт консультация",
                  REQUESTED: "Ожидает подтверждения",
                  SCHEDULED: "Запланирована",
                }[consultation.status] ?? consultation.status
              }
            />
            {consultation.completedAt ? (
              <DetailItem
                label="Время завершения"
                value={formatDateTime(consultation.completedAt)}
              />
            ) : null}
            <DetailItem
              label="Статус времени приёма"
              value={
                consultation.scheduleSlot?.status === "BOOKED"
                  ? "Забронировано"
                  : consultation.scheduleSlot?.status === "AVAILABLE"
                    ? "Доступно"
                    : consultation.scheduleSlot?.status === "CANCELLED"
                      ? "Отменено"
                      : consultation.scheduleSlot?.status === "BLOCKED"
                        ? "Заблокировано"
                        : "Не связано"
              }
            />
            <DetailItem
              label="Специальность"
              value={consultation.doctor.specialty?.name ?? "Не назначено"}
            />
            <DetailItem
              label="Пациент"
              value={consultation.patient.user.name ?? "Профиль пациента"}
            />
            <DetailItem
              label="Дата рождения"
              value={formatDate(consultation.patient.dateOfBirth)}
            />
            <DetailItem
              label="Пол"
              value={consultation.patient.gender ?? "Не указано"}
            />
          </dl>
        </aside>
      </section>
    </div>
  );
}
