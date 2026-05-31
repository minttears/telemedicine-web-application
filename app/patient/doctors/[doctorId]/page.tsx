import Link from "next/link";
import { notFound } from "next/navigation";

import { BookingForm } from "@/components/patient/booking-form";
import { ProfileImage } from "@/components/profile/profile-image";
import { prisma } from "@/lib/prisma";

type PatientDoctorProfilePageProps = {
  params: Promise<{
    doctorId: string;
  }>;
};

const MIN_BOOKING_LEAD_TIME_MS = 30 * 60 * 1000;

function formatExperience(years: number | null) {
  if (!years) {
    return "Not specified";
  }

  return `${years} ${years === 1 ? "year" : "years"}`;
}

function getInitials(name: string | null) {
  return (name ?? "DR").slice(0, 2).toUpperCase();
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

function formatReviewDate(value: Date) {
  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
  }).format(value);
}

function formatReviewSummary(averageRating: number | null, reviewCount: number) {
  if (reviewCount === 0 || averageRating === null) {
    return "No reviews yet";
  }

  return `${averageRating.toFixed(1)} out of 5 (${reviewCount} ${
    reviewCount === 1 ? "review" : "reviews"
  })`;
}

export default async function PatientDoctorProfilePage({
  params,
}: PatientDoctorProfilePageProps) {
  const { doctorId } = await params;
  const minimumStartsAt = new Date(
    new Date().getTime() + MIN_BOOKING_LEAD_TIME_MS,
  );

  const doctor = await prisma.doctorProfile.findFirst({
    where: {
      id: doctorId,
      isAvailable: true,
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
            gte: minimumStartsAt,
          },
          status: "AVAILABLE",
        },
        orderBy: {
          startsAt: "asc",
        },
        take: 5,
      },
      user: {
        select: {
          name: true,
        },
      },
      doctorReviews: {
        orderBy: {
          createdAt: "desc",
        },
        select: {
          comment: true,
          createdAt: true,
          id: true,
          rating: true,
        },
        take: 10,
      },
    },
  });

  if (!doctor) {
    notFound();
  }

  const reviewAggregate = await prisma.doctorReview.aggregate({
    where: {
      doctorProfileId: doctor.id,
    },
    _avg: {
      rating: true,
    },
    _count: {
      _all: true,
    },
  });

  const reviewAverageRating = reviewAggregate._avg.rating;
  const reviewCount = reviewAggregate._count._all;

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
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
            <ProfileImage
              alt={`${doctor.user.name ?? "Doctor profile"} photo`}
              className="h-24 w-24 shrink-0"
              initials={getInitials(doctor.user.name)}
              src={
                doctor.photoStoragePath
                  ? `/api/profile-images/doctor/${doctor.id}`
                  : undefined
              }
            />
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
              <p className="mt-3 text-sm font-medium text-slate-700">
                {formatReviewSummary(reviewAverageRating, reviewCount)}
              </p>
            </div>
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

      <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-sm font-medium text-teal-700">Patient reviews</p>
            <h2 className="mt-2 text-xl font-semibold text-slate-950">
              {formatReviewSummary(reviewAverageRating, reviewCount)}
            </h2>
          </div>
          <span className="inline-flex w-fit rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-medium text-slate-600">
            Verified patients
          </span>
        </div>

        {doctor.doctorReviews.length > 0 ? (
          <ul className="mt-5 grid gap-3">
            {doctor.doctorReviews.map((review) => (
              <li
                className="rounded-md border border-slate-200 bg-slate-50 p-4"
                key={review.id}
              >
                <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-sm font-semibold text-slate-950">
                    Verified patient
                  </p>
                  <p className="text-xs text-slate-500">
                    {formatReviewDate(review.createdAt)}
                  </p>
                </div>
                <p className="mt-2 text-sm font-medium text-teal-800">
                  {review.rating.toFixed(1)} out of 5
                </p>
                {review.comment ? (
                  <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-slate-700">
                    {review.comment}
                  </p>
                ) : null}
              </li>
            ))}
          </ul>
        ) : (
          <div className="mt-5 rounded-md border border-dashed border-slate-300 bg-slate-50 p-5">
            <p className="text-sm font-medium text-slate-950">No reviews yet.</p>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Reviews will appear after verified patients complete consultations
              and submit feedback.
            </p>
          </div>
        )}
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
              Available slots
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
                  <BookingForm doctorId={doctor.id} scheduleSlotId={slot.id} />
                </li>
              ))}
            </ul>
          ) : (
            <div className="mt-5 rounded-md border border-dashed border-slate-300 bg-slate-50 p-5">
              <p className="text-sm font-medium text-slate-950">
                No upcoming available slots are listed yet.
              </p>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                New availability will appear here when future schedule slots are
                available for booking.
              </p>
            </div>
          )}

          <p className="mt-4 text-sm leading-6 text-slate-600">
            Booking creates a scheduled consultation for the selected time. Chat
            and secure file attachments are available after booking.
          </p>
        </div>

        <aside className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-950">
            Book a consultation
          </h2>
          <p className="mt-3 text-sm leading-6 text-slate-600">
            Choose an available time from the schedule preview. The selected
            slot will be reserved when the booking is confirmed. Only times at
            least 30 minutes from now are shown.
          </p>
          <p className="mt-3 text-sm leading-6 text-slate-600">
            Consultation chat and secure file attachments are available from the
            consultation page after booking.
          </p>
        </aside>
      </section>
    </div>
  );
}
