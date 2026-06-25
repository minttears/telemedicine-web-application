import Link from "next/link";
import type { ConsultationStatus } from "@prisma/client";

import { requireWorkspaceRole } from "@/lib/auth/workspace";
import { prisma } from "@/lib/prisma";

const consultationFilters = ["upcoming", "completed", "all"] as const;
const upcomingStatuses: ConsultationStatus[] = [
  "REQUESTED",
  "SCHEDULED",
  "IN_PROGRESS",
];

type ConsultationFilter = (typeof consultationFilters)[number];

type DoctorConsultationsPageProps = {
  searchParams?: Promise<{
    filter?: string | string[];
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

function getConsultationFilter(value: string | string[] | undefined) {
  const filter = Array.isArray(value) ? value[0] : value;

  if (filter && consultationFilters.includes(filter as ConsultationFilter)) {
    return filter as ConsultationFilter;
  }

  return "upcoming";
}

function getFilterLabel(filter: ConsultationFilter) {
  if (filter === "completed") {
    return "Завершённые";
  }

  if (filter === "all") {
    return "Все";
  }

  return "Предстоящие";
}

function getEmptyState(filter: ConsultationFilter) {
  if (filter === "completed") {
    return {
      body: "Завершённые консультации появятся здесь после добавления итогового заключения.",
      title: "Завершённых консультаций пока нет",
    };
  }

  if (filter === "all") {
    return {
      body: "Назначенные консультации появятся здесь после записи пациентов на доступное время.",
      title: "Назначенных консультаций пока нет",
    };
  }

  return {
    body: "Предстоящие консультации появятся здесь после записи пациентов.",
    title: "Предстоящих консультаций нет",
  };
}

function getStatusLabel(status: string) {
  const labels: Record<string, string> = {
    CANCELLED: "Отменена",
    COMPLETED: "Завершена",
    IN_PROGRESS: "Идёт консультация",
    REQUESTED: "Ожидает подтверждения",
    SCHEDULED: "Запланирована",
  };

  return labels[status] ?? status;
}

function getSlotStatusLabel(status: string | undefined) {
  const labels: Record<string, string> = {
    AVAILABLE: "Доступно",
    BLOCKED: "Заблокировано",
    BOOKED: "Забронировано",
    CANCELLED: "Отменено",
  };

  return status ? (labels[status] ?? status) : "Не связано";
}

function getStatusClassName(status: string) {
  if (status === "COMPLETED") {
    return "border-emerald-200 bg-emerald-50 text-emerald-700";
  }

  if (status === "IN_PROGRESS") {
    return "border-amber-200 bg-amber-50 text-amber-700";
  }

  if (status === "CANCELLED") {
    return "border-slate-200 bg-slate-100 text-slate-600";
  }

  if (status === "REQUESTED") {
    return "border-sky-200 bg-sky-50 text-sky-700";
  }

  return "border-teal-200 bg-teal-50 text-teal-700";
}

function ConsultationFilterTabs({ activeFilter }: { activeFilter: ConsultationFilter }) {
  return (
    <nav
      aria-label="Фильтры консультаций"
      className="flex flex-wrap gap-2 rounded-lg border border-slate-200 bg-white p-2 shadow-sm"
    >
      {consultationFilters.map((filter) => (
        <Link
          aria-current={activeFilter === filter ? "page" : undefined}
          className={`inline-flex min-h-10 items-center rounded-md px-4 text-sm font-medium transition ${
            activeFilter === filter
              ? "bg-teal-700 text-white"
              : "text-slate-700 hover:bg-slate-100 hover:text-teal-700"
          }`}
          href={`/doctor/consultations?filter=${filter}`}
          key={filter}
        >
          {getFilterLabel(filter)}
        </Link>
      ))}
    </nav>
  );
}

export default async function DoctorConsultationsPage({
  searchParams,
}: DoctorConsultationsPageProps) {
  const [resolvedSearchParams, user] = await Promise.all([
    searchParams,
    requireWorkspaceRole("DOCTOR"),
  ]);
  const activeFilter = getConsultationFilter(resolvedSearchParams?.filter);
  const emptyState = getEmptyState(activeFilter);

  const consultations = await prisma.consultation.findMany({
    where: {
      doctor: {
        userId: user.id,
      },
      ...(activeFilter === "upcoming"
        ? {
            status: {
              in: upcomingStatuses,
            },
          }
        : {}),
      ...(activeFilter === "completed"
        ? {
            status: "COMPLETED",
          }
        : {}),
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
    },
    orderBy:
      activeFilter === "completed"
        ? [
            {
              completedAt: "desc",
            },
            {
              scheduledAt: "desc",
            },
          ]
        : {
            scheduledAt: "asc",
          },
  });

  return (
    <div className="space-y-6">
      <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-sm font-medium text-teal-700">Консультации</p>
        <h1 className="mt-3 text-3xl font-semibold tracking-normal text-slate-950">
          Назначенные консультации
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">
          Просматривайте предстоящие консультации и историю завершённых
          обращений. Для завершённых консультаций сохраняются чат и итоговое
          заключение.
        </p>
        <p className="mt-4 text-sm font-medium text-slate-700">
          Назначено консультаций: {consultations.length}
        </p>
      </section>

      <ConsultationFilterTabs activeFilter={activeFilter} />

      {consultations.length > 0 ? (
        <section className="grid gap-4">
          {consultations.map((consultation) => (
            <article
              className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm"
              key={consultation.id}
            >
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="text-sm font-medium text-teal-700">
                    {consultation.doctor.specialty?.name ??
                      "Специальность не назначена"}
                  </p>
                  <h2 className="mt-2 text-xl font-semibold text-slate-950">
                    {consultation.patient.user.name ?? "Профиль пациента"}
                  </h2>
                </div>
                <span
                  className={`inline-flex w-fit rounded-full border px-3 py-1 text-xs font-medium ${getStatusClassName(
                    consultation.status,
                  )}`}
                >
                  {getStatusLabel(consultation.status)}
                </span>
              </div>

              <dl className="mt-5 grid gap-3 text-sm sm:grid-cols-2 lg:grid-cols-4">
                <div>
                  <dt className="font-medium text-slate-700">Время приёма</dt>
                  <dd className="mt-1 text-slate-600">
                    {formatDateTime(consultation.scheduledAt)}
                  </dd>
                </div>
                <div>
                  <dt className="font-medium text-slate-700">Дата рождения</dt>
                  <dd className="mt-1 text-slate-600">
                    {formatDate(consultation.patient.dateOfBirth)}
                  </dd>
                </div>
                <div>
                  <dt className="font-medium text-slate-700">Пол</dt>
                  <dd className="mt-1 text-slate-600">
                    {consultation.patient.gender ?? "Не указано"}
                  </dd>
                </div>
                <div>
                  <dt className="font-medium text-slate-700">
                    Статус времени приёма
                  </dt>
                  <dd className="mt-1 text-slate-600">
                    {getSlotStatusLabel(consultation.scheduleSlot?.status)}
                  </dd>
                </div>
                {consultation.completedAt ? (
                  <div>
                    <dt className="font-medium text-slate-700">
                      Время завершения
                    </dt>
                    <dd className="mt-1 text-slate-600">
                      {formatDateTime(consultation.completedAt)}
                    </dd>
                  </div>
                ) : null}
                {consultation.status === "COMPLETED" ? (
                  <div>
                    <dt className="font-medium text-slate-700">
                      Заключение врача
                    </dt>
                    <dd className="mt-1 text-slate-600">
                      {consultation.doctorNotes?.trim()
                        ? "Доступно"
                        : "Не добавлено"}
                    </dd>
                  </div>
                ) : null}
              </dl>

              <div className="mt-5">
                <Link
                  className="inline-flex min-h-10 items-center justify-center rounded-md bg-teal-700 px-4 text-sm font-medium text-white transition hover:bg-teal-800"
                  href={`/doctor/consultations/${consultation.id}`}
                >
                  Открыть консультацию
                </Link>
              </div>
            </article>
          ))}
        </section>
      ) : (
        <section className="rounded-lg border border-dashed border-slate-300 bg-white p-8 text-center">
          <h2 className="text-lg font-semibold text-slate-950">
            {emptyState.title}
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-slate-600">
            {emptyState.body}
          </p>
        </section>
      )}
    </div>
  );
}
