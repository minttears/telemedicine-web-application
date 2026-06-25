import Link from "next/link";

import { requireRole } from "@/lib/auth/current-user";
import { prisma } from "@/lib/prisma";

function formatDateTime(value: Date) {
  return new Intl.DateTimeFormat("ru-RU", {
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

function formatReviewValue(averageRating: number | null, reviewCount: number) {
  if (reviewCount === 0 || averageRating === null) {
    return "Нет отзывов";
  }

  return averageRating.toLocaleString("ru-RU", {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  });
}

export default async function DoctorDashboardPage() {
  const user = await requireRole("DOCTOR");
  const now = new Date();

  const doctorProfile = await prisma.doctorProfile.findUnique({
    where: { userId: user.id },
    include: { specialty: true },
  });

  const [
    upcomingSlots,
    bookedConsultations,
    activeConsultations,
    nextSlots,
    reviewAggregate,
  ] = doctorProfile
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
          prisma.doctorReview.aggregate({
            where: {
              doctorProfileId: doctorProfile.id,
            },
            _avg: {
              rating: true,
            },
            _count: {
              _all: true,
            },
          }),
        ])
    : [0, 0, 0, [], null];

  const reviewAverageRating = reviewAggregate?._avg.rating ?? null;
  const reviewCount = reviewAggregate?._count._all ?? 0;

  return (
    <div className="space-y-8">
      <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-sm font-medium text-teal-700">Кабинет врача</p>
        <h1 className="mt-3 text-3xl font-semibold tracking-normal text-slate-950">
          Добро пожаловать{user.name ? `, ${user.name}` : ""}
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">
          Просматривайте расписание и статусы консультаций. Добавляйте доступное
          время и открывайте назначенные консультации в кабинете врача.
        </p>
      </section>

      <section
        aria-label="Обзор кабинета врача"
        className="grid gap-4 md:grid-cols-2 xl:grid-cols-4"
      >
        <StatCard
          detail="Доступное время для будущих консультаций."
          label="Доступное время"
          value={upcomingSlots}
        />
        <StatCard
          detail="Запрошенные или запланированные консультации."
          label="Запланировано"
          value={bookedConsultations}
        />
        <StatCard
          detail="Консультации, которые проходят сейчас."
          label="Активные"
          value={activeConsultations}
        />
        <StatCard
          detail={`Подтверждённых отзывов: ${reviewCount}.`}
          label="Рейтинг пациентов"
          value={formatReviewValue(reviewAverageRating, reviewCount)}
        />
      </section>

      <section className="grid gap-4 lg:grid-cols-[1fr_1fr]">
        <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-950">
            Краткая информация о профиле
          </h2>
          {doctorProfile ? (
            <dl className="mt-4 grid gap-3 text-sm">
              <div>
                <dt className="font-medium text-slate-700">Специальность</dt>
                <dd className="mt-1 text-slate-600">
                  {doctorProfile.specialty?.name ?? "Не назначено"}
                </dd>
              </div>
              <div>
                <dt className="font-medium text-slate-700">
                  Доступность для записи
                </dt>
                <dd className="mt-1 text-slate-600">
                  {doctorProfile.isAvailable
                    ? "Доступен для записи"
                    : "Недоступен для записи"}
                </dd>
              </div>
              <div>
                <dt className="font-medium text-slate-700">Стаж</dt>
                <dd className="mt-1 text-slate-600">
                  {doctorProfile.experienceYears
                    ? `${doctorProfile.experienceYears} лет`
                    : "Не указано"}
                </dd>
              </div>
            </dl>
          ) : (
            <p className="mt-3 text-sm leading-6 text-slate-600">
              Ваш профиль врача пока не настроен.
            </p>
          )}
          <Link
            className="mt-5 inline-flex min-h-10 items-center rounded-md border border-slate-300 bg-white px-3 text-sm font-medium text-slate-700 transition hover:border-teal-600 hover:text-teal-700"
            href="/doctor/profile"
          >
            Открыть профиль
          </Link>
        </div>

        <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-950">
            Ближайшее доступное время
          </h2>
          {nextSlots.length > 0 ? (
            <ul className="mt-4 divide-y divide-slate-100">
              {nextSlots.map((slot) => (
                <li className="py-3" key={slot.id}>
                  <p className="text-sm font-medium text-slate-900">
                    {formatDateTime(slot.startsAt)}
                  </p>
                  <p className="mt-1 text-sm text-slate-500">
                    Окончание: {formatDateTime(slot.endsAt)}
                  </p>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-3 text-sm leading-6 text-slate-600">
              Доступное время пока не добавлено. Создайте будущие интервалы,
              чтобы пациенты могли записаться на консультацию.
            </p>
          )}
          <Link
            className="mt-5 inline-flex min-h-10 items-center rounded-md border border-slate-300 bg-white px-3 text-sm font-medium text-slate-700 transition hover:border-teal-600 hover:text-teal-700"
            href="/doctor/schedule"
          >
            Управлять расписанием
          </Link>
        </div>
      </section>
    </div>
  );
}
