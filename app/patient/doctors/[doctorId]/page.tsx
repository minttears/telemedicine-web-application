import Link from "next/link";
import { notFound } from "next/navigation";

import { prisma } from "@/lib/prisma";

type PatientDoctorProfilePageProps = {
  params: Promise<{
    doctorId: string;
  }>;
};

function formatExperience(years: number | null) {
  if (!years) {
    return "Not specified";
  }

  return `${years} ${years === 1 ? "year" : "years"}`;
}

function formatSlotDate(value: Date) {
  return new Intl.DateTimeFormat("en", {
    weekday: "short",
    month: "short",
    day: "numeric",
  }).format(value);
}

function formatSlotTime(value: Date) {
  return new Intl.DateTimeFormat("en", {
    hour: "numeric",
    minute: "2-digit",
  }).format(value);
}

export default async function PatientDoctorProfilePage({
  params,
}: PatientDoctorProfilePageProps) {
  const { doctorId } = await params;

  const doctor = await prisma.doctorProfile.findFirst({
    where: {
      id: doctorId,
      user: {
        isActive: true,
        role: "DOCTOR",
      },
    },
    include: {
      specialty: true,
      scheduleSlots: {
        where: {
          startsAt: {
            gt: new Date(),
          },
          status: "AVAILABLE",
        },
        orderBy: {
          startsAt: "asc",
        },
        take: 3,
      },
      user: true,
    },
  });

  if (!doctor) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <Link
        className="inline-flex min-h-10 items-center rounded-md border border-slate-300 bg-white px-3 text-sm font-medium text-slate-700 transition hover:border-teal-700 hover:text-teal-700"
        href="/patient/doctors"
      >
        Back to doctors
      </Link>

      <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-sm font-medium text-teal-700">
              {doctor.specialty?.name ?? "Specialty not assigned"}
            </p>
            <h1 className="mt-3 text-3xl font-semibold tracking-normal text-slate-950">
              {doctor.user.name ?? "Doctor profile"}
            </h1>
            {doctor.title ? (
              <p className="mt-2 text-base text-slate-600">{doctor.title}</p>
            ) : null}
          </div>
          <span
            className={`inline-flex w-fit rounded-full border px-3 py-1 text-xs font-medium ${
              doctor.isAvailable
                ? "border-teal-200 bg-teal-50 text-teal-700"
                : "border-slate-200 bg-slate-100 text-slate-600"
            }`}
          >
            {doctor.isAvailable ? "Available" : "Unavailable"}
          </span>
        </div>

        <p className="mt-5 max-w-3xl text-sm leading-6 text-slate-600">
          {doctor.bio ?? "Profile details have not been added yet."}
        </p>
      </section>

      <section className="grid gap-4 md:grid-cols-4">
        <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-medium text-slate-600">Experience</p>
          <p className="mt-2 text-lg font-semibold text-slate-950">
            {formatExperience(doctor.experienceYears)}
          </p>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-medium text-slate-600">Education</p>
          <p className="mt-2 text-lg font-semibold text-slate-950">
            {doctor.education ?? "Not specified"}
          </p>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-medium text-slate-600">Specialty</p>
          <p className="mt-2 text-lg font-semibold text-slate-950">
            {doctor.specialty?.name ?? "Not assigned"}
          </p>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-medium text-slate-600">Availability</p>
          <p className="mt-2 text-lg font-semibold text-slate-950">
            {doctor.isAvailable ? "Available" : "Unavailable"}
          </p>
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-[1fr_320px]">
        <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-sm font-medium text-teal-700">
                Schedule preview
              </p>
              <h2 className="mt-2 text-xl font-semibold text-slate-950">
                Upcoming available slots
              </h2>
            </div>
            <span className="inline-flex w-fit rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-medium text-slate-600">
              Read-only
            </span>
          </div>

          {doctor.scheduleSlots.length > 0 ? (
            <ul className="mt-5 grid gap-3">
              {doctor.scheduleSlots.map((slot) => (
                <li
                  className="rounded-md border border-slate-200 bg-slate-50 p-4"
                  key={slot.id}
                >
                  <p className="text-sm font-semibold text-slate-950">
                    {formatSlotDate(slot.startsAt)}
                  </p>
                  <p className="mt-1 text-sm text-slate-600">
                    {formatSlotTime(slot.startsAt)} -{" "}
                    {formatSlotTime(slot.endsAt)}
                  </p>
                </li>
              ))}
            </ul>
          ) : (
            <div className="mt-5 rounded-md border border-dashed border-slate-300 bg-slate-50 p-5">
              <p className="text-sm font-medium text-slate-950">
                No upcoming available slots are listed yet.
              </p>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                New availability will appear here after schedule management is
                implemented.
              </p>
            </div>
          )}

          <p className="mt-4 text-sm leading-6 text-slate-600">
            These times are shown for preview only. Slot selection and booking
            will be implemented in a later phase.
          </p>
        </div>

        <aside className="rounded-lg border border-dashed border-slate-300 bg-white p-6">
          <h2 className="text-lg font-semibold text-slate-950">
            Booking is not available yet
          </h2>
          <p className="mt-3 text-sm leading-6 text-slate-600">
            Consultation booking, schedule selection, chat, and file uploads
            will be added in later phases. This page currently shows safe
            read-only doctor profile information.
          </p>
        </aside>
      </section>
    </div>
  );
}
