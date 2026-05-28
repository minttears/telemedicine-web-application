import Link from "next/link";

import { requireWorkspaceRole } from "@/lib/auth/workspace";
import { prisma } from "@/lib/prisma";

function formatDateTime(value: Date) {
  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(value);
}

function formatDate(value: Date | null) {
  if (!value) {
    return "Not specified";
  }

  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
  }).format(value);
}

export default async function DoctorConsultationsPage() {
  const user = await requireWorkspaceRole("DOCTOR");

  const consultations = await prisma.consultation.findMany({
    where: {
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
          user: true,
        },
      },
      scheduleSlot: true,
    },
    orderBy: {
      scheduledAt: "asc",
    },
  });

  return (
    <div className="space-y-6">
      <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-sm font-medium text-teal-700">Consultations</p>
        <h1 className="mt-3 text-3xl font-semibold tracking-normal text-slate-950">
          Assigned consultations
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">
          Review consultations assigned to your doctor profile and reply in
          text chat. File uploads and additional consultation tools will be
          added in later phases.
        </p>
        <p className="mt-4 text-sm font-medium text-slate-700">
          {consultations.length}{" "}
          {consultations.length === 1 ? "consultation" : "consultations"}{" "}
          assigned
        </p>
      </section>

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
                    {consultation.patient.user.name ?? "Patient profile"}
                  </h2>
                </div>
                <span className="inline-flex w-fit rounded-full border border-teal-200 bg-teal-50 px-3 py-1 text-xs font-medium text-teal-700">
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
                  <dt className="font-medium text-slate-700">Date of birth</dt>
                  <dd className="mt-1 text-slate-600">
                    {formatDate(consultation.patient.dateOfBirth)}
                  </dd>
                </div>
                <div>
                  <dt className="font-medium text-slate-700">Gender</dt>
                  <dd className="mt-1 text-slate-600">
                    {consultation.patient.gender ?? "Not specified"}
                  </dd>
                </div>
                <div>
                  <dt className="font-medium text-slate-700">Slot status</dt>
                  <dd className="mt-1 text-slate-600">
                    {consultation.scheduleSlot?.status ?? "Not linked"}
                  </dd>
                </div>
              </dl>

              <div className="mt-5">
                <Link
                  className="inline-flex min-h-10 items-center justify-center rounded-md bg-teal-700 px-4 text-sm font-medium text-white transition hover:bg-teal-800"
                  href={`/doctor/consultations/${consultation.id}`}
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
            No consultations assigned yet
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-slate-600">
            Booked consultations will appear here after patients reserve
            available times.
          </p>
        </section>
      )}
    </div>
  );
}
