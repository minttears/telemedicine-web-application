import Link from "next/link";
import { notFound } from "next/navigation";
import { MessageType } from "@prisma/client";

import {
  ConsultationSummaryPanel,
  ConsultationStatusBadge,
  ConsultationMessagesPanel,
} from "@/components/consultations/consultation-display";
import { VideoCallPanel } from "@/components/consultations/video-call-panel";
import { ReviewForm } from "@/components/reviews/review-form";
import { requireWorkspaceRole } from "@/lib/auth/workspace";
import { prisma } from "@/lib/prisma";
import { getVideoCallAvailability } from "@/lib/video/call-window";

type PatientConsultationPageProps = {
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

function SubmittedReview({
  review,
}: {
  review: {
    comment: string | null;
    createdAt: Date;
    rating: number;
  };
}) {
  return (
    <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
      <p className="text-sm font-medium text-teal-700">Отзыв о враче</p>
      <h2 className="mt-2 text-lg font-semibold text-slate-950">
        Ваш отзыв
      </h2>
      <div className="mt-4 rounded-md border border-slate-200 bg-slate-50 p-4">
        <p className="text-sm font-semibold text-slate-950">
          {review.rating.toLocaleString("ru-RU", {
            minimumFractionDigits: 1,
            maximumFractionDigits: 1,
          })}{" "}
          из 5
        </p>
        {review.comment ? (
          <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-slate-700">
            {review.comment}
          </p>
        ) : (
          <p className="mt-3 text-sm leading-6 text-slate-600">
            Текстовый комментарий не добавлен.
          </p>
        )}
        <p className="mt-3 text-xs text-slate-500">
          Отправлен {formatDateTime(review.createdAt)}
        </p>
      </div>
    </section>
  );
}

export default async function PatientConsultationPage({
  params,
}: PatientConsultationPageProps) {
  const [{ consultationId }, user] = await Promise.all([
    params,
    requireWorkspaceRole("PATIENT"),
  ]);

  const consultation = await prisma.consultation.findFirst({
    where: {
      id: consultationId,
      patient: {
        userId: user.id,
      },
    },
    include: {
      doctor: {
        include: {
          specialty: true,
          user: {
            select: {
              name: true,
            },
          },
        },
      },
      scheduleSlot: true,
      doctorReview: {
        select: {
          comment: true,
          createdAt: true,
          id: true,
          rating: true,
        },
      },
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
        href="/patient/consultations"
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
              {consultation.doctor.user.name ?? "Профиль врача"}
            </h1>
            {consultation.doctor.title ? (
              <p className="mt-2 text-base text-slate-600">
                {consultation.doctor.title}
              </p>
            ) : null}
          </div>
          <ConsultationStatusBadge status={consultation.status} />
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-[1fr_320px]">
        <div className="space-y-4">
          <VideoCallPanel
            callHref={`/patient/consultations/${consultation.id}/call`}
            disabledReason={videoCallAvailability.reason}
            isEligible={videoCallAvailability.isEligible}
            role="PATIENT"
          />
          {completedDoctorNotes ? (
            <ConsultationSummaryPanel
              additionalNotes={consultation.additionalNotes}
              completedAt={consultation.completedAt}
              diagnosisDetails={consultation.diagnosisDetails}
              diagnosisStatus={consultation.diagnosisStatus}
              doctorNotes={completedDoctorNotes}
              followUpInstructions={consultation.followUpInstructions}
              medicationNotes={consultation.medicationNotes}
              recommendations={consultation.recommendations}
              title="Заключение врача"
            />
          ) : null}
          {consultation.status === "COMPLETED" ? (
            consultation.doctorReview ? (
              <SubmittedReview review={consultation.doctorReview} />
            ) : (
              <ReviewForm consultationId={consultation.id} />
            )
          ) : null}
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
                  IN_PROGRESS: "Идёт сейчас",
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
                      : "Не связано"
              }
            />
            <DetailItem
              label="Врач"
              value={consultation.doctor.user.name ?? "Профиль врача"}
            />
            <DetailItem
              label="Специальность"
              value={consultation.doctor.specialty?.name ?? "Не назначено"}
            />
          </dl>
        </aside>
      </section>
    </div>
  );
}
