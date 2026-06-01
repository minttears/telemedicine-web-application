import Link from "next/link";
import { notFound } from "next/navigation";

import { ConsultationStatusBadge } from "@/components/consultations/consultation-display";
import { LiveKitCallRoom } from "@/components/consultations/livekit-call-room";
import { requireWorkspaceRole } from "@/lib/auth/workspace";
import { prisma } from "@/lib/prisma";
import { getVideoCallAvailability } from "@/lib/video/call-window";

type DoctorCallPageProps = {
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

export default async function DoctorCallPage({ params }: DoctorCallPageProps) {
  const [{ consultationId }, user] = await Promise.all([
    params,
    requireWorkspaceRole("DOCTOR"),
  ]);

  const consultation = await prisma.consultation.findFirst({
    where: {
      doctor: {
        userId: user.id,
      },
      id: consultationId,
    },
    select: {
      doctor: {
        select: {
          specialty: {
            select: {
              name: true,
            },
          },
        },
      },
      id: true,
      patient: {
        select: {
          user: {
            select: {
              name: true,
            },
          },
        },
      },
      scheduleSlot: {
        select: {
          endsAt: true,
          startsAt: true,
        },
      },
      scheduledAt: true,
      status: true,
    },
  });

  if (!consultation) {
    notFound();
  }

  const videoCallAvailability = getVideoCallAvailability({
    endsAt: consultation.scheduleSlot?.endsAt,
    scheduledAt: consultation.scheduledAt,
    startsAt: consultation.scheduleSlot?.startsAt,
    status: consultation.status,
  });
  const backHref = `/doctor/consultations/${consultation.id}`;

  return (
    <div className="space-y-6">
      <Link
        className="inline-flex min-h-10 items-center rounded-md border border-slate-300 bg-white px-3 text-sm font-medium text-slate-700 transition hover:border-teal-700 hover:text-teal-700"
        href={backHref}
      >
        Back to consultation
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

      <LiveKitCallRoom
        backHref={backHref}
        consultationId={consultation.id}
        disabledReason={videoCallAvailability.reason}
        isEligible={videoCallAvailability.isEligible}
        role="DOCTOR"
      />
    </div>
  );
}
