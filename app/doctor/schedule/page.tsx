import { ScheduleSlotActions } from "@/components/doctor/schedule-slot-actions";
import { ScheduleSlotForm } from "@/components/doctor/schedule-slot-form";
import { requireWorkspaceRole } from "@/lib/auth/workspace";
import { prisma } from "@/lib/prisma";

function formatDateTime(value: Date) {
  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(value);
}

function formatTime(value: Date) {
  return new Intl.DateTimeFormat("en", {
    hour: "numeric",
    minute: "2-digit",
  }).format(value);
}

function getDurationLabel(startsAt: Date, endsAt: Date) {
  const durationMinutes = Math.round(
    (endsAt.getTime() - startsAt.getTime()) / 60000,
  );

  if (durationMinutes < 60) {
    return `${durationMinutes} minutes`;
  }

  const hours = Math.floor(durationMinutes / 60);
  const minutes = durationMinutes % 60;

  if (minutes === 0) {
    return `${hours} ${hours === 1 ? "hour" : "hours"}`;
  }

  return `${hours} ${hours === 1 ? "hour" : "hours"} ${minutes} minutes`;
}

function getStatusClassName(status: string) {
  if (status === "AVAILABLE") {
    return "border-teal-200 bg-teal-50 text-teal-700";
  }

  if (status === "BOOKED") {
    return "border-sky-200 bg-sky-50 text-sky-700";
  }

  if (status === "CANCELLED") {
    return "border-slate-200 bg-slate-100 text-slate-600";
  }

  return "border-amber-200 bg-amber-50 text-amber-700";
}

export default async function DoctorSchedulePage() {
  const user = await requireWorkspaceRole("DOCTOR");
  const now = new Date();

  const doctorProfile = await prisma.doctorProfile.findUnique({
    where: {
      userId: user.id,
    },
    select: {
      id: true,
      specialty: {
        select: {
          name: true,
        },
      },
    },
  });

  const slots = doctorProfile
    ? await prisma.doctorScheduleSlot.findMany({
        where: {
          doctorId: doctorProfile.id,
          startsAt: {
            gte: now,
          },
        },
        orderBy: {
          startsAt: "asc",
        },
      })
    : [];

  const availableSlotCount = slots.filter(
    (slot) => slot.status === "AVAILABLE",
  ).length;

  return (
    <div className="space-y-6">
      <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-sm font-medium text-teal-700">Schedule</p>
        <h1 className="mt-3 text-3xl font-semibold tracking-normal text-slate-950">
          Manage available times
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">
          Create future consultation slots patients can book from your doctor
          profile. Booked slots are read-only in this phase.
        </p>
        {doctorProfile?.specialty ? (
          <p className="mt-4 text-sm font-medium text-slate-700">
            Specialty: {doctorProfile.specialty.name}
          </p>
        ) : null}
      </section>

      {!doctorProfile ? (
        <section className="rounded-lg border border-dashed border-slate-300 bg-white p-8 text-center">
          <h2 className="text-lg font-semibold text-slate-950">
            Doctor profile required
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-slate-600">
            Your doctor profile must be configured before schedule slots can be
            managed.
          </p>
        </section>
      ) : (
        <>
          <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="text-sm font-medium text-teal-700">
                  New availability
                </p>
                <h2 className="mt-2 text-xl font-semibold text-slate-950">
                  Create a future slot
                </h2>
              </div>
              <span className="inline-flex w-fit rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-medium text-slate-600">
                15 minutes to 4 hours
              </span>
            </div>
            <div className="mt-5">
              <ScheduleSlotForm />
            </div>
          </section>

          <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="text-sm font-medium text-teal-700">
                  Future schedule
                </p>
                <h2 className="mt-2 text-xl font-semibold text-slate-950">
                  Upcoming slots
                </h2>
              </div>
              <span className="inline-flex w-fit rounded-full border border-teal-200 bg-teal-50 px-3 py-1 text-xs font-medium text-teal-700">
                {availableSlotCount} available
              </span>
            </div>

            {slots.length > 0 ? (
              <ul className="mt-5 grid gap-3">
                {slots.map((slot) => (
                  <li
                    className="rounded-lg border border-slate-200 bg-slate-50 p-4"
                    key={slot.id}
                  >
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                      <div>
                        <p className="text-sm font-semibold text-slate-950">
                          {formatDateTime(slot.startsAt)}
                        </p>
                        <p className="mt-1 text-sm text-slate-600">
                          {formatTime(slot.startsAt)} -{" "}
                          {formatTime(slot.endsAt)}
                        </p>
                        <p className="mt-1 text-sm text-slate-500">
                          Duration: {getDurationLabel(slot.startsAt, slot.endsAt)}
                        </p>
                      </div>
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
                        <span
                          className={`inline-flex w-fit rounded-full border px-3 py-1 text-xs font-medium ${getStatusClassName(
                            slot.status,
                          )}`}
                        >
                          {slot.status}
                        </span>
                        {slot.status === "AVAILABLE" ? (
                          <ScheduleSlotActions slotId={slot.id} />
                        ) : null}
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="mt-5 rounded-lg border border-dashed border-slate-300 bg-slate-50 p-6 text-center">
                <h3 className="text-sm font-semibold text-slate-950">
                  No future schedule slots
                </h3>
                <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-slate-600">
                  Create an available slot to let patients book a consultation
                  time from your profile.
                </p>
              </div>
            )}
          </section>
        </>
      )}
    </div>
  );
}
