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

type PatientConsultationsPageProps = {
  searchParams?: Promise<{
    filter?: string | string[];
  }>;
};

function formatDateTime(value: Date) {
  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "short",
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
    return "Completed";
  }

  if (filter === "all") {
    return "All";
  }

  return "Upcoming";
}

function getEmptyState(filter: ConsultationFilter) {
  if (filter === "completed") {
    return {
      body: "Completed consultations will appear here after your doctor adds a final summary.",
      title: "No completed consultations yet",
    };
  }

  if (filter === "all") {
    return {
      body: "Choose a doctor and book an available time to create your first consultation.",
      title: "No consultations booked yet",
    };
  }

  return {
    body: "Upcoming consultations will appear here after you book an available doctor time.",
    title: "No upcoming consultations",
  };
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
      aria-label="Consultation filters"
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
          href={`/patient/consultations?filter=${filter}`}
          key={filter}
        >
          {getFilterLabel(filter)}
        </Link>
      ))}
    </nav>
  );
}

export default async function PatientConsultationsPage({
  searchParams,
}: PatientConsultationsPageProps) {
  const [resolvedSearchParams, user] = await Promise.all([
    searchParams,
    requireWorkspaceRole("PATIENT"),
  ]);
  const activeFilter = getConsultationFilter(resolvedSearchParams?.filter);
  const emptyState = getEmptyState(activeFilter);

  const consultations = await prisma.consultation.findMany({
    where: {
      patient: {
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
        <p className="text-sm font-medium text-teal-700">Consultations</p>
        <h1 className="mt-3 text-3xl font-semibold tracking-normal text-slate-950">
          Your consultations
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">
          Review upcoming visits and completed consultation history. Completed
          consultations keep their chat history and doctor summary.
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
                      "Specialty not assigned"}
                  </p>
                  <h2 className="mt-2 text-xl font-semibold text-slate-950">
                    {consultation.doctor.user.name ?? "Doctor profile"}
                  </h2>
                  {consultation.doctor.title ? (
                    <p className="mt-1 text-sm text-slate-600">
                      {consultation.doctor.title}
                    </p>
                  ) : null}
                </div>
                <span
                  className={`inline-flex w-fit rounded-full border px-3 py-1 text-xs font-medium ${getStatusClassName(
                    consultation.status,
                  )}`}
                >
                  {consultation.status}
                </span>
              </div>

              <dl className="mt-5 grid gap-3 text-sm sm:grid-cols-2 lg:grid-cols-4">
                <div>
                  <dt className="font-medium text-slate-700">Scheduled time</dt>
                  <dd className="mt-1 text-slate-600">
                    {formatDateTime(consultation.scheduledAt)}
                  </dd>
                </div>
                <div>
                  <dt className="font-medium text-slate-700">Slot status</dt>
                  <dd className="mt-1 text-slate-600">
                    {consultation.scheduleSlot?.status ?? "Not linked"}
                  </dd>
                </div>
                {consultation.completedAt ? (
                  <div>
                    <dt className="font-medium text-slate-700">
                      Completed time
                    </dt>
                    <dd className="mt-1 text-slate-600">
                      {formatDateTime(consultation.completedAt)}
                    </dd>
                  </div>
                ) : null}
                {consultation.status === "COMPLETED" ? (
                  <div>
                    <dt className="font-medium text-slate-700">
                      Doctor summary
                    </dt>
                    <dd className="mt-1 text-slate-600">
                      {consultation.doctorNotes?.trim()
                        ? "Available"
                        : "Not recorded"}
                    </dd>
                  </div>
                ) : null}
              </dl>

              <div className="mt-5">
                <Link
                  className="inline-flex min-h-10 items-center justify-center rounded-md bg-teal-700 px-4 text-sm font-medium text-white transition hover:bg-teal-800"
                  href={`/patient/consultations/${consultation.id}`}
                >
                  View consultation
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
          {activeFilter === "all" ? (
            <Link
              className="mt-5 inline-flex min-h-10 items-center justify-center rounded-md bg-teal-700 px-4 text-sm font-medium text-white transition hover:bg-teal-800"
              href="/patient/doctors"
            >
              Find a doctor
            </Link>
          ) : null}
        </section>
      )}
    </div>
  );
}
