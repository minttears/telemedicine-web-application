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

export default async function DoctorDashboardPage() {
  const user = await requireRole("DOCTOR");
  const now = new Date();

  const doctorProfile = await prisma.doctorProfile.findUnique({
    where: { userId: user.id },
    include: { specialty: true },
  });

  const [upcomingSlots, bookedConsultations, activeConsultations, nextSlots] =
    doctorProfile
      ? await Promise.all([
          prisma.doctorScheduleSlot.count({
            where: {
              doctorId: doctorProfile.id,
              startsAt: { gte: now },
              status: "AVAILABLE",
            },
          }),
          prisma.consultation.count({
            where: {
              doctorId: doctorProfile.id,
              status: { in: ["REQUESTED", "SCHEDULED"] },
            },
          }),
          prisma.consultation.count({
            where: {
              doctorId: doctorProfile.id,
              status: "IN_PROGRESS",
            },
          }),
          prisma.doctorScheduleSlot.findMany({
            where: {
              doctorId: doctorProfile.id,
              startsAt: { gte: now },
              status: "AVAILABLE",
            },
            orderBy: { startsAt: "asc" },
            take: 3,
          }),
        ])
      : [0, 0, 0, []];

  return (
    <div className="space-y-8">
      <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-sm font-medium text-teal-700">Doctor dashboard</p>
        <h1 className="mt-3 text-3xl font-semibold tracking-normal text-slate-950">
          Welcome{user.name ? `, ${user.name}` : ""}
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">
          Review your schedule availability and consultation status. Manage
          future slots and open assigned consultations from your workspace.
        </p>
      </section>

      <section
        aria-label="Doctor overview"
        className="grid gap-4 md:grid-cols-3"
      >
        <StatCard
          detail="Available future schedule slots."
          label="Upcoming slots"
          value={upcomingSlots}
        />
        <StatCard
          detail="Requested or scheduled consultations."
          label="Booked"
          value={bookedConsultations}
        />
        <StatCard
          detail="Consultations currently marked as in progress."
          label="Active"
          value={activeConsultations}
        />
      </section>

      <section className="grid gap-4 lg:grid-cols-[1fr_1fr]">
        <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-950">
            Profile summary
          </h2>
          {doctorProfile ? (
            <dl className="mt-4 grid gap-3 text-sm">
              <div>
                <dt className="font-medium text-slate-700">Specialty</dt>
                <dd className="mt-1 text-slate-600">
                  {doctorProfile.specialty?.name ?? "Not assigned"}
                </dd>
              </div>
              <div>
                <dt className="font-medium text-slate-700">Availability</dt>
                <dd className="mt-1 text-slate-600">
                  {doctorProfile.isAvailable ? "Available" : "Unavailable"}
                </dd>
              </div>
              <div>
                <dt className="font-medium text-slate-700">Experience</dt>
                <dd className="mt-1 text-slate-600">
                  {doctorProfile.experienceYears
                    ? `${doctorProfile.experienceYears} years`
                    : "Not specified"}
                </dd>
              </div>
            </dl>
          ) : (
            <p className="mt-3 text-sm leading-6 text-slate-600">
              Your doctor profile is not configured yet.
            </p>
          )}
          <Link
            className="mt-5 inline-flex min-h-10 items-center rounded-md border border-slate-300 bg-white px-3 text-sm font-medium text-slate-700 transition hover:border-teal-600 hover:text-teal-700"
            href="/doctor/profile"
          >
            Review profile
          </Link>
        </div>

        <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-950">
            Next schedule slots
          </h2>
          {nextSlots.length > 0 ? (
            <ul className="mt-4 divide-y divide-slate-100">
              {nextSlots.map((slot) => (
                <li className="py-3" key={slot.id}>
                  <p className="text-sm font-medium text-slate-900">
                    {formatDateTime(slot.startsAt)}
                  </p>
                  <p className="mt-1 text-sm text-slate-500">
                    Ends {formatDateTime(slot.endsAt)}
                  </p>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-3 text-sm leading-6 text-slate-600">
              No upcoming available slots are configured yet. Add future slots so
              patients can reserve consultation times.
            </p>
          )}
          <Link
            className="mt-5 inline-flex min-h-10 items-center rounded-md border border-slate-300 bg-white px-3 text-sm font-medium text-slate-700 transition hover:border-teal-600 hover:text-teal-700"
            href="/doctor/schedule"
          >
            Manage schedule
          </Link>
        </div>
      </section>
    </div>
  );
}
