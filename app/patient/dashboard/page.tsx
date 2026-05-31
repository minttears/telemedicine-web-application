import Link from "next/link";

import { requireRole } from "@/lib/auth/current-user";
import { prisma } from "@/lib/prisma";

function formatDateTime(value: Date) {
  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(value);
}

function StatCard({
  label,
  value,
  detail,
}: {
  label: string;
  value: string | number;
  detail: string;
}) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <p className="text-sm font-medium text-slate-600">{label}</p>
      <p className="mt-3 text-3xl font-semibold text-slate-950">{value}</p>
      <p className="mt-2 text-sm leading-6 text-slate-500">{detail}</p>
    </div>
  );
}

function ActionLink({
  href,
  label,
  description,
}: {
  href: string;
  label: string;
  description: string;
}) {
  return (
    <Link
      className="block rounded-lg border border-slate-200 bg-white p-5 shadow-sm transition hover:border-teal-600"
      href={href}
    >
      <span className="text-base font-semibold text-slate-950">{label}</span>
      <span className="mt-2 block text-sm leading-6 text-slate-600">
        {description}
      </span>
    </Link>
  );
}

export default async function PatientDashboardPage() {
  const user = await requireRole("PATIENT");
  const now = new Date();

  const patientProfile = await prisma.patientProfile.findUnique({
    where: { userId: user.id },
  });

  const [
    upcomingConsultations,
    activeConsultations,
    totalConsultations,
    nextConsultation,
  ] = patientProfile
    ? await Promise.all([
          prisma.consultation.count({
            where: {
              patientId: patientProfile.id,
              scheduledAt: { gte: now },
              status: { in: ["REQUESTED", "SCHEDULED"] },
            },
          }),
          prisma.consultation.count({
            where: {
              patientId: patientProfile.id,
              status: "IN_PROGRESS",
            },
          }),
          prisma.consultation.count({
            where: {
              patientId: patientProfile.id,
            },
          }),
          prisma.consultation.findFirst({
            where: {
              patientId: patientProfile.id,
              scheduledAt: { gte: now },
              status: { in: ["REQUESTED", "SCHEDULED", "IN_PROGRESS"] },
            },
            orderBy: { scheduledAt: "asc" },
            select: {
              id: true,
              scheduledAt: true,
              status: true,
              doctor: {
                select: {
                  specialty: {
                    select: {
                      name: true,
                    },
                  },
                  user: {
                    select: {
                      name: true,
                    },
                  },
                },
              },
            },
          }),
        ])
    : [0, 0, 0, null];

  const profileFields = [
    Boolean(user.name),
    Boolean(user.email),
    Boolean(patientProfile?.dateOfBirth),
    Boolean(patientProfile?.gender),
  ];
  const completedFields = profileFields.filter(Boolean).length;
  const profileCompletion = Math.round((completedFields / profileFields.length) * 100);

  return (
    <div className="space-y-8">
      <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-sm font-medium text-teal-700">Patient dashboard</p>
        <h1 className="mt-3 text-3xl font-semibold tracking-normal text-slate-950">
          Welcome{user.name ? `, ${user.name}` : ""}
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">
          Manage your consultations, messages, files, doctor access, and care
          history from one protected workspace.
        </p>
      </section>

      <section
        aria-label="Patient overview"
        className="grid gap-4 md:grid-cols-2 xl:grid-cols-4"
      >
        <StatCard
          detail="Scheduled or requested consultations with a future time."
          label="Upcoming"
          value={upcomingConsultations}
        />
        <StatCard
          detail="Consultations currently marked as in progress."
          label="Active"
          value={activeConsultations}
        />
        <StatCard
          detail="All consultations linked to your patient profile."
          label="Total consultations"
          value={totalConsultations}
        />
        <StatCard
          detail="Based on name, email, date of birth, and gender."
          label="Profile completion"
          value={`${profileCompletion}%`}
        />
      </section>

      <section className="grid gap-4 lg:grid-cols-[1fr_1fr]">
        <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-950">
            Next consultation
          </h2>
          {nextConsultation ? (
            <div className="mt-4 space-y-3 text-sm leading-6 text-slate-600">
              <p className="font-medium text-slate-900">
                {formatDateTime(nextConsultation.scheduledAt)}
              </p>
              <p>
                {nextConsultation.doctor.user.name ?? "Doctor profile"}
                {nextConsultation.doctor.specialty?.name
                  ? `, ${nextConsultation.doctor.specialty.name}`
                  : ""}
              </p>
              <Link
                className="inline-flex min-h-10 items-center rounded-md border border-slate-300 bg-white px-3 text-sm font-medium text-slate-700 transition hover:border-teal-600 hover:text-teal-700"
                href={`/patient/consultations/${nextConsultation.id}`}
              >
                Open consultation
              </Link>
            </div>
          ) : (
            <p className="mt-3 text-sm leading-6 text-slate-600">
              You do not have an upcoming consultation. Browse available doctors
              to choose a time and book your next visit.
            </p>
          )}
        </div>

        <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-950">
            Next actions
          </h2>
          <div className="mt-4 grid gap-3">
            <ActionLink
              description="Review and complete basic patient details."
              href="/patient/profile"
              label="Complete profile"
            />
            <ActionLink
              description="Find active doctors by name or specialty and book an available time."
              href="/patient/doctors"
              label="Browse doctors"
            />
            <ActionLink
              description="View consultation history when records exist."
              href="/patient/consultations"
              label="View consultations"
            />
          </div>
        </div>
      </section>
    </div>
  );
}
