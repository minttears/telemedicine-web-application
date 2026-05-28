import Link from "next/link";
import { notFound } from "next/navigation";
import { MessageType } from "@prisma/client";

import {
  ConsultationSummaryPanel,
  ConsultationStatusBadge,
  ConsultationMessagesPanel,
  PlaceholderPanel,
} from "@/components/consultations/consultation-display";
import { ConsultationCompletionForm } from "@/components/consultations/consultation-completion-form";
import { requireWorkspaceRole } from "@/lib/auth/workspace";
import { prisma } from "@/lib/prisma";

type DoctorConsultationPageProps = {
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

function formatDate(value: Date | null) {
  if (!value) {
    return "Not specified";
  }

  return new Intl.DateTimeFormat("en", {
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
          user: true,
        },
      },
      scheduleSlot: true,
      messages: {
        where: {
          type: MessageType.TEXT,
        },
        orderBy: {
          createdAt: "asc",
        },
        select: {
          body: true,
          createdAt: true,
          id: true,
          sender: {
            select: {
              name: true,
              role: true,
            },
          },
        },
      },
    },
  });

  if (!consultation) {
    notFound();
  }

  const completedDoctorNotes = consultation.doctorNotes?.trim() ?? "";

  return (
    <div className="space-y-6">
      <Link
        className="inline-flex min-h-10 items-center rounded-md border border-slate-300 bg-white px-3 text-sm font-medium text-slate-700 transition hover:border-teal-700 hover:text-teal-700"
        href="/doctor/consultations"
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
              {consultation.patient.user.name ?? "Patient profile"}
            </h1>
            <p className="mt-2 text-base text-slate-600">
              Scheduled for {formatDateTime(consultation.scheduledAt)}
            </p>
          </div>
          <ConsultationStatusBadge status={consultation.status} />
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-[1fr_320px]">
        <div className="space-y-4">
          {consultation.status === "COMPLETED" ? (
            <ConsultationSummaryPanel
              completedAt={consultation.completedAt}
              doctorNotes={completedDoctorNotes || "No summary was recorded."}
              title="Completed summary"
            />
          ) : (
            <ConsultationCompletionForm consultationId={consultation.id} />
          )}
          <ConsultationMessagesPanel
            consultationId={consultation.id}
            messages={consultation.messages}
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
            {consultation.completedAt ? (
              <DetailItem
                label="Completed time"
                value={formatDateTime(consultation.completedAt)}
              />
            ) : null}
            <DetailItem
              label="Slot status"
              value={consultation.scheduleSlot?.status ?? "Not linked"}
            />
            <DetailItem
              label="Specialty"
              value={consultation.doctor.specialty?.name ?? "Not assigned"}
            />
            <DetailItem
              label="Patient"
              value={consultation.patient.user.name ?? "Patient profile"}
            />
            <DetailItem
              label="Date of birth"
              value={formatDate(consultation.patient.dateOfBirth)}
            />
            <DetailItem
              label="Gender"
              value={consultation.patient.gender ?? "Not specified"}
            />
          </dl>
        </aside>
      </section>
    </div>
  );
}
