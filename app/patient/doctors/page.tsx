import Link from "next/link";

import { ProfileImage } from "@/components/profile/profile-image";
import {
  symptomSpecialtyMap,
  symptomSpecialtyMappings,
} from "@/lib/doctors/symptom-specialty-map";
import { prisma } from "@/lib/prisma";

type PatientDoctorsPageProps = {
  searchParams: Promise<{
    q?: string;
    specialty?: string;
    symptom?: string;
  }>;
};

type DoctorWithDirectoryData = Awaited<
  ReturnType<typeof getDoctors>
>[number];

function normalizeSearchParam(value: string | undefined) {
  const normalized = value?.trim();
  return normalized ? normalized : undefined;
}

function buildDirectoryHref({
  query,
  specialty,
  symptom,
}: {
  query?: string;
  specialty?: string;
  symptom?: string;
}) {
  const params = new URLSearchParams();

  if (query) {
    params.set("q", query);
  }

  if (specialty) {
    params.set("specialty", specialty);
  }

  if (symptom) {
    params.set("symptom", symptom);
  }

  const serialized = params.toString();
  return serialized ? `/patient/doctors?${serialized}` : "/patient/doctors";
}

function getDoctorDisplayName(doctor: DoctorWithDirectoryData) {
  return doctor.user.name ?? "Профиль врача";
}

function getInitials(name: string | null) {
  return (name ?? "DR").slice(0, 2).toUpperCase();
}

function getShortBio(bio: string | null) {
  if (!bio) {
    return "Информация о враче пока не добавлена.";
  }

  return bio.length > 180 ? `${bio.slice(0, 177).trim()}...` : bio;
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

function formatDoctorCount(count: number) {
  const word =
    count % 10 === 1 && count % 100 !== 11
      ? "врач"
      : count % 10 >= 2 &&
          count % 10 <= 4 &&
          (count % 100 < 12 || count % 100 > 14)
        ? "врача"
        : "врачей";

  return `${count} ${word}`;
}

async function getDoctors({
  query,
  specialty,
  symptomSpecialtySlugs,
}: {
  query?: string;
  specialty?: string;
  symptomSpecialtySlugs?: string[];
}) {
  const specialtyFilters = [
    {
      specialty: {
        isActive: true,
      },
    },
    ...(specialty
      ? [
          {
            specialty: {
              isActive: true,
              slug: specialty,
            },
          },
        ]
      : []),
    ...(symptomSpecialtySlugs?.length
      ? [
          {
            specialty: {
              isActive: true,
              slug: {
                in: symptomSpecialtySlugs,
              },
            },
          },
        ]
      : []),
  ];

  const doctors = await prisma.doctorProfile.findMany({
    where: {
      AND: specialtyFilters,
      isAvailable: true,
      user: {
        isActive: true,
        role: "DOCTOR",
        ...(query
          ? {
              name: {
                contains: query,
                mode: "insensitive",
              },
            }
          : {}),
      },
    },
    select: {
      bio: true,
      education: true,
      experienceYears: true,
      id: true,
      isAvailable: true,
      photoStoragePath: true,
      specialty: {
        select: {
          name: true,
        },
      },
      title: true,
      user: {
        select: {
          name: true,
        },
      },
    },
    orderBy: [{ isAvailable: "desc" }, { updatedAt: "desc" }],
  });

  const reviewStats = doctors.length
    ? await prisma.doctorReview.groupBy({
        by: ["doctorProfileId"],
        where: {
          doctorProfileId: {
            in: doctors.map((doctor) => doctor.id),
          },
        },
        _avg: {
          rating: true,
        },
        _count: {
          _all: true,
        },
      })
    : [];

  const statsByDoctorId = new Map(
    reviewStats.map((item) => [
      item.doctorProfileId,
      {
        averageRating: item._avg.rating,
        reviewCount: item._count._all,
      },
    ]),
  );

  return doctors.map((doctor) => ({
    ...doctor,
    reviewAverageRating: statsByDoctorId.get(doctor.id)?.averageRating ?? null,
    reviewCount: statsByDoctorId.get(doctor.id)?.reviewCount ?? 0,
  }));
}

function DoctorCard({ doctor }: { doctor: DoctorWithDirectoryData }) {
  return (
    <article className="flex h-full flex-col rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start gap-4">
        <ProfileImage
          alt={`Фотография врача: ${getDoctorDisplayName(doctor)}`}
          className="h-16 w-16 shrink-0"
          initials={getInitials(doctor.user.name)}
          src={
            doctor.photoStoragePath
              ? `/api/profile-images/doctor/${doctor.id}`
              : undefined
          }
        />
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-teal-700">
            {doctor.specialty?.name ?? "Специальность не назначена"}
          </p>
          <h2 className="mt-2 text-xl font-semibold text-slate-950">
            {getDoctorDisplayName(doctor)}
          </h2>
          {doctor.title ? (
            <p className="mt-1 text-sm text-slate-600">{doctor.title}</p>
          ) : null}
        </div>
      </div>
      <span
        className={`mt-4 inline-flex w-fit rounded-full border px-3 py-1 text-xs font-medium ${
          doctor.isAvailable
            ? "border-teal-200 bg-teal-50 text-teal-700"
            : "border-slate-200 bg-slate-100 text-slate-600"
        }`}
      >
        {doctor.isAvailable ? "Доступен для записи" : "Недоступен для записи"}
      </span>
      <p className="mt-3 text-sm font-medium text-slate-700">
        {formatReviewSummary(doctor.reviewAverageRating, doctor.reviewCount)}
      </p>

      <p className="mt-4 text-sm leading-6 text-slate-600">
        {getShortBio(doctor.bio)}
      </p>

      <dl className="mt-5 grid gap-3 text-sm">
        <div>
          <dt className="font-medium text-slate-700">Стаж</dt>
          <dd className="mt-1 text-slate-600">
            {doctor.experienceYears
              ? `${doctor.experienceYears} лет`
              : "Не указано"}
          </dd>
        </div>
        <div>
          <dt className="font-medium text-slate-700">Образование</dt>
          <dd className="mt-1 text-slate-600">
            {doctor.education ?? "Не указано"}
          </dd>
        </div>
      </dl>

      <div className="mt-auto pt-5">
        <Link
          className="inline-flex min-h-10 w-full items-center justify-center rounded-md bg-teal-700 px-4 text-sm font-medium text-white transition hover:bg-teal-800"
          href={`/patient/doctors/${doctor.id}`}
        >
          Открыть профиль
        </Link>
      </div>
    </article>
  );
}

export default async function PatientDoctorsPage({
  searchParams,
}: PatientDoctorsPageProps) {
  const { q, specialty, symptom } = await searchParams;
  const query = normalizeSearchParam(q);
  const specialtySlug = normalizeSearchParam(specialty);
  const symptomSlug = normalizeSearchParam(symptom);
  const selectedSymptom = symptomSlug
    ? symptomSpecialtyMap.get(symptomSlug)
    : undefined;
  const effectiveSymptomSlug = selectedSymptom?.slug;

  const [specialties, allDoctorCount, doctors] = await Promise.all([
    prisma.specialty.findMany({
      where: { isActive: true },
      orderBy: { name: "asc" },
    }),
    prisma.doctorProfile.count({
      where: {
        isAvailable: true,
        specialty: {
          isActive: true,
        },
        user: {
          isActive: true,
          role: "DOCTOR",
        },
      },
    }),
    getDoctors({
      query,
      specialty: specialtySlug,
      symptomSpecialtySlugs: selectedSymptom?.specialtySlugs,
    }),
  ]);

  const mappedSpecialtyNames = selectedSymptom
    ? specialties
        .filter((item) => selectedSymptom.specialtySlugs.includes(item.slug))
        .map((item) => item.name)
    : [];
  const hasFilters = Boolean(query || specialtySlug || effectiveSymptomSlug);

  return (
    <div className="space-y-8">
      <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-sm font-medium text-teal-700">Каталог врачей</p>
        <h1 className="mt-3 text-3xl font-semibold tracking-normal text-slate-950">
          Найдите врача
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">
          Найдите доступного врача по имени, специальности или симптому.
          Подбор по симптомам помогает выбрать направление, но не заменяет
          медицинскую консультацию.
        </p>
        <p className="mt-4 text-sm font-medium text-slate-700">
          В каталоге: {formatDoctorCount(allDoctorCount)}
        </p>
      </section>

      <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <form className="grid gap-4 lg:grid-cols-[1fr_240px_280px_auto]" action="/patient/doctors">
          <label className="block">
            <span className="text-sm font-medium text-slate-700">
              Поиск по имени врача
            </span>
            <input
              className="mt-2 min-h-11 w-full rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-teal-700 focus:ring-2 focus:ring-teal-100"
              defaultValue={query}
              name="q"
              placeholder="Введите имя врача"
              type="search"
            />
          </label>

          <label className="block">
            <span className="text-sm font-medium text-slate-700">
              Специальность
            </span>
            <select
              className="mt-2 min-h-11 w-full rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-950 outline-none transition focus:border-teal-700 focus:ring-2 focus:ring-teal-100"
              defaultValue={specialtySlug ?? ""}
              name="specialty"
            >
              <option value="">Все специальности</option>
              {specialties.map((item) => (
                <option key={item.id} value={item.slug}>
                  {item.name}
                </option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="text-sm font-medium text-slate-700">
              Симптомы
            </span>
            <select
              className="mt-2 min-h-11 w-full rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-950 outline-none transition focus:border-teal-700 focus:ring-2 focus:ring-teal-100"
              defaultValue={effectiveSymptomSlug ?? ""}
              name="symptom"
            >
              <option value="">Все симптомы</option>
              {symptomSpecialtyMappings.map((item) => (
                <option key={item.slug} value={item.slug}>
                  {item.label}
                </option>
              ))}
            </select>
          </label>

          <div className="flex items-end gap-3">
            <button
              className="inline-flex min-h-11 items-center justify-center rounded-md bg-teal-700 px-4 text-sm font-medium text-white transition hover:bg-teal-800"
              type="submit"
            >
              Применить
            </button>
            {hasFilters ? (
              <Link
                className="inline-flex min-h-11 items-center justify-center rounded-md border border-slate-300 bg-white px-4 text-sm font-medium text-slate-700 transition hover:border-teal-700 hover:text-teal-700"
                href="/patient/doctors"
              >
                Сбросить
              </Link>
            ) : null}
          </div>
        </form>
      </section>

      <section className="rounded-lg border border-sky-100 bg-sky-50 p-4 shadow-sm">
        <p className="text-sm font-medium text-slate-950">
          Симптомы помогают подобрать подходящие специальности. Это не заменяет
          консультацию врача.
        </p>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          Фильтр не ставит диагноз, не выполняет AI-триаж и не предназначен для
          экстренной медицинской помощи.
        </p>
        {selectedSymptom ? (
          <p className="mt-2 text-sm leading-6 text-slate-700">
            Выбранный симптом: {selectedSymptom.label}. Рекомендуемые
            специальности:{" "}
            {mappedSpecialtyNames.length > 0
              ? mappedSpecialtyNames.join(", ")
              : selectedSymptom.specialtySlugs.join(", ")}.
          </p>
        ) : null}
        {selectedSymptom?.emergencyNotice ? (
          <p className="mt-2 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm font-medium text-amber-900">
            При экстренной ситуации немедленно обратитесь за неотложной
            медицинской помощью.
          </p>
        ) : null}
      </section>

      {doctors.length > 0 ? (
        <section
          aria-label="Результаты поиска врачей"
          className="grid gap-4 md:grid-cols-2 xl:grid-cols-3"
        >
          {doctors.map((doctor) => (
            <DoctorCard doctor={doctor} key={doctor.id} />
          ))}
        </section>
      ) : (
        <section className="rounded-lg border border-dashed border-slate-300 bg-white p-8 text-center">
          <h2 className="text-lg font-semibold text-slate-950">
            {allDoctorCount === 0
              ? "Доступных врачей пока нет"
              : "По выбранным фильтрам врачи не найдены"}
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-slate-600">
            {allDoctorCount === 0
              ? "Профили врачей появятся здесь после их добавления."
              : "Измените имя врача, специальность или выбранный симптом."}
          </p>
          {hasFilters ? (
            <Link
              className="mt-5 inline-flex min-h-10 items-center justify-center rounded-md border border-slate-300 bg-white px-4 text-sm font-medium text-slate-700 transition hover:border-teal-700 hover:text-teal-700"
                href={buildDirectoryHref({})}
            >
              Сбросить фильтры
            </Link>
          ) : null}
        </section>
      )}
    </div>
  );
}
