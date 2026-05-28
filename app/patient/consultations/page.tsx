import Link from "next/link";

import { requireWorkspaceRole } from "@/lib/auth/workspace";
import { prisma } from "@/lib/prisma";

function formatDateTime(value: Date) {
  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(value);
}

export default async function PatientConsultationsPage() {
  const user = await requireWorkspaceRole("PATIENT");

  const consultations = await prisma.consultation.findMany({
    where: {
      patient: {
        userId: user.id,
      },
    },
    include: {
      doctor: {
        include: {
          specialty: true,
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
          Your consultations
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">
          View your scheduled consultations. Chat and file uploads will be added
          in later phases.
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
                    {consultation.doctor.user.name ?? "Doctor profile"}
                  </h2>
                  {consultation.doctor.title ? (
                    <p className="mt-1 text-sm text-slate-600">
                      {consultation.doctor.title}
                    </p>
                  ) : null}
                </div>
                <span className="inline-flex w-fit rounded-full border border-teal-200 bg-teal-50 px-3 py-1 text-xs font-medium text-teal-700">
                  {consultation.status}
                </span>
              </div>

              <dl className="mt-5 grid gap-3 text-sm sm:grid-cols-2">
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
            No consultations booked yet
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-slate-600">
            Choose a doctor and book an available time to create your first
            consultation.
          </p>
          <Link
            className="mt-5 inline-flex min-h-10 items-center justify-center rounded-md bg-teal-700 px-4 text-sm font-medium text-white transition hover:bg-teal-800"
            href="/patient/doctors"
          >
            Find a doctor
          </Link>
        </section>
      )}
    </div>
  );
}
