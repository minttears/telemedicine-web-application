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
    return "Не указано";
  }

  const word =
    years % 10 === 1 && years % 100 !== 11
      ? "год"
      : years % 10 >= 2 &&
          years % 10 <= 4 &&
          (years % 100 < 12 || years % 100 > 14)
        ? "года"
        : "лет";

  return `${years} ${word}`;
}

function getInitials(name: string | null) {
  return (name ?? "DR").slice(0, 2).toUpperCase();
}

function formatSlotDate(value: Date) {
  return new Intl.DateTimeFormat("ru-RU", {
    weekday: "short",
    month: "short",
    day: "numeric",
  }).format(value);
}

function formatSlotTime(value: Date) {
  return new Intl.DateTimeFormat("ru-RU", {
    hour: "numeric",
    minute: "2-digit",
  }).format(value);
}

function formatReviewDate(value: Date) {
  return new Intl.DateTimeFormat("ru-RU", {
    dateStyle: "medium",
  }).format(value);
}

function formatReviewSummary(averageRating: number | null, reviewCount: number) {
  if (reviewCount === 0 || averageRating === null) {
    return "Отзывов пока нет";
  }

  return `${averageRating.toLocaleString("ru-RU", {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  })} из 5 (${reviewCount} ${
    reviewCount % 10 === 1 && reviewCount % 100 !== 11
      ? "отзыв"
      : reviewCount % 10 >= 2 &&
          reviewCount % 10 <= 4 &&
          (reviewCount % 100 < 12 || reviewCount % 100 > 14)
        ? "отзыва"
        : "отзывов"
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
        Вернуться к врачам
      </Link>

      <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
            <ProfileImage
              alt={`Фотография врача: ${doctor.user.name ?? "Профиль врача"}`}
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
                {doctor.specialty?.name ?? "Специальность не назначена"}
              </p>
              <h1 className="mt-3 text-3xl font-semibold tracking-normal text-slate-950">
                {doctor.user.name ?? "Профиль врача"}
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
            {doctor.isAvailable
              ? "Доступен для записи"
              : "Недоступен для записи"}
          </span>
        </div>

        <p className="mt-5 max-w-3xl text-sm leading-6 text-slate-600">
          {doctor.bio ?? "Информация о враче пока не добавлена."}
        </p>
      </section>

      <section className="grid gap-4 md:grid-cols-4">
        <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-medium text-slate-600">Стаж</p>
          <p className="mt-2 text-lg font-semibold text-slate-950">
            {formatExperience(doctor.experienceYears)}
          </p>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-medium text-slate-600">Образование</p>
          <p className="mt-2 text-lg font-semibold text-slate-950">
            {doctor.education ?? "Не указано"}
          </p>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-medium text-slate-600">Специальность</p>
          <p className="mt-2 text-lg font-semibold text-slate-950">
            {doctor.specialty?.name ?? "Не назначено"}
          </p>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-medium text-slate-600">
            Доступность для записи
          </p>
          <p className="mt-2 text-lg font-semibold text-slate-950">
            {doctor.isAvailable
              ? "Доступен для записи"
              : "Недоступен для записи"}
          </p>
        </div>
      </section>

      <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-sm font-medium text-teal-700">Отзывы пациентов</p>
            <h2 className="mt-2 text-xl font-semibold text-slate-950">
              {formatReviewSummary(reviewAverageRating, reviewCount)}
            </h2>
          </div>
          <span className="inline-flex w-fit rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-medium text-slate-600">
            Подтверждённые пациенты
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
                    Подтверждённый пациент
                  </p>
                  <p className="text-xs text-slate-500">
                    {formatReviewDate(review.createdAt)}
                  </p>
                </div>
                <p className="mt-2 text-sm font-medium text-teal-800">
                  {review.rating.toLocaleString("ru-RU", {
                    minimumFractionDigits: 1,
                    maximumFractionDigits: 1,
                  })}{" "}
                  из 5
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
            <p className="text-sm font-medium text-slate-950">
              Отзывов пока нет.
            </p>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Отзывы появятся после завершённых консультаций, когда пациенты
              поделятся обратной связью.
            </p>
          </div>
        )}
      </section>

      <section className="grid gap-4 lg:grid-cols-[1fr_320px]">
        <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-sm font-medium text-teal-700">
                Расписание
              </p>
              <h2 className="mt-2 text-xl font-semibold text-slate-950">
                Ближайшее доступное время
              </h2>
            </div>
            <span className="inline-flex w-fit rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-medium text-slate-600">
              Доступное время
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
                Доступного времени для записи пока нет.
              </p>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                Новое время появится здесь, когда врач обновит расписание.
              </p>
            </div>
          )}

          <p className="mt-4 text-sm leading-6 text-slate-600">
            После подтверждения записи будет создана запланированная
            консультация. Чат и защищённая отправка файлов станут доступны на
            странице консультации.
          </p>
        </div>

        <aside className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-950">
            Записаться на консультацию
          </h2>
          <p className="mt-3 text-sm leading-6 text-slate-600">
            Выберите доступное время в расписании. После подтверждения оно будет
            зарезервировано за вами. Отображается время, до которого осталось не
            менее 30 минут.
          </p>
          <p className="mt-3 text-sm leading-6 text-slate-600">
            После записи на странице консультации будут доступны чат и
            защищённая отправка файлов.
          </p>
        </aside>
      </section>
    </div>
  );
}
