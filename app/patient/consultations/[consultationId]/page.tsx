import Link from "next/link";
import { notFound } from "next/navigation";

import { requireWorkspaceRole } from "@/lib/auth/workspace";
import { prisma } from "@/lib/prisma";

type PatientConsultationPageProps = {
  params: Promise<{
    consultationId: string;
  }>;
};

function formatDateTime(value: Date) {
  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(value);
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
          user: true,
        },
      },
      scheduleSlot: true,
    },
  });

  if (!consultation) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <Link
        className="inline-flex min-h-10 items-center rounded-md border border-slate-300 bg-white px-3 text-sm font-medium text-slate-700 transition hover:border-teal-700 hover:text-teal-700"
        href="/patient/consultations"
      >
        Back to consultations
      </Link>

      <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-sm font-medium text-teal-700">
              {consultation.doctor.specialty?.name ?? "Specialty not assigned"}
            </p>
            <h1 className="mt-3 text-3xl font-semibold tracking-normal text-slate-950">
              {consultation.doctor.user.name ?? "Doctor profile"}
            </h1>
            {consultation.doctor.title ? (
              <p className="mt-2 text-base text-slate-600">
                {consultation.doctor.title}
              </p>
            ) : null}
          </div>
          <span className="inline-flex w-fit rounded-full border border-teal-200 bg-teal-50 px-3 py-1 text-xs font-medium text-teal-700">
            {consultation.status}
          </span>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-medium text-slate-600">Scheduled time</p>
          <p className="mt-2 text-lg font-semibold text-slate-950">
            {formatDateTime(consultation.scheduledAt)}
          </p>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-medium text-slate-600">Consultation status</p>
          <p className="mt-2 text-lg font-semibold text-slate-950">
            {consultation.status}
          </p>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-medium text-slate-600">Slot status</p>
          <p className="mt-2 text-lg font-semibold text-slate-950">
            {consultation.scheduleSlot?.status ?? "Not linked"}
          </p>
        </div>
      </section>

      <section className="rounded-lg border border-dashed border-slate-300 bg-white p-6">
        <h2 className="text-lg font-semibold text-slate-950">
          Consultation workspace is not available yet
        </h2>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">
          This first booking phase creates the scheduled consultation. Chat,
          messages, file uploads, and video calls will be added in later phases.
        </p>
      </section>
    </div>
  );
}
