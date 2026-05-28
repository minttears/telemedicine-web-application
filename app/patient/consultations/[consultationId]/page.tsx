import Link from "next/link";
import { notFound } from "next/navigation";

import {
  ConsultationStatusBadge,
  PlaceholderPanel,
} from "@/components/consultations/consultation-display";
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
          <ConsultationStatusBadge status={consultation.status} />
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-[1fr_320px]">
        <div className="space-y-4">
          <PlaceholderPanel
            body="Messages will be added in a later phase."
            title="Chat is not available yet"
          />
          <PlaceholderPanel
            body="Uploads will be added in a later phase."
            title="File attachments are not available yet"
          />
        </div>

        <aside className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-medium text-teal-700">
            Consultation summary
          </p>
          <dl className="mt-5 grid gap-4 text-sm">
            <DetailItem
              label="Scheduled time"
              value={formatDateTime(consultation.scheduledAt)}
            />
            <DetailItem
              label="Consultation status"
              value={consultation.status}
            />
            <DetailItem
              label="Slot status"
              value={consultation.scheduleSlot?.status ?? "Not linked"}
            />
            <DetailItem
              label="Doctor"
              value={consultation.doctor.user.name ?? "Doctor profile"}
            />
            <DetailItem
              label="Specialty"
              value={consultation.doctor.specialty?.name ?? "Not assigned"}
            />
          </dl>
        </aside>
      </section>
    </div>
  );
}
