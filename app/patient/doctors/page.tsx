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
  return doctor.user.name ?? "Doctor profile";
}

function getInitials(name: string | null) {
  return (name ?? "DR").slice(0, 2).toUpperCase();
}

function getShortBio(bio: string | null) {
  if (!bio) {
    return "Profile details will be expanded in a later phase.";
  }

  return bio.length > 180 ? `${bio.slice(0, 177).trim()}...` : bio;
}

function formatReviewSummary(averageRating: number | null, reviewCount: number) {
  if (reviewCount === 0 || averageRating === null) {
    return "No reviews yet";
  }

  return `${averageRating.toFixed(1)} out of 5 (${reviewCount} ${
    reviewCount === 1 ? "review" : "reviews"
  })`;
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
          alt={`${getDoctorDisplayName(doctor)} photo`}
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
            {doctor.specialty?.name ?? "Specialty not assigned"}
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
        {doctor.isAvailable ? "Available" : "Unavailable"}
      </span>
      <p className="mt-3 text-sm font-medium text-slate-700">
        {formatReviewSummary(doctor.reviewAverageRating, doctor.reviewCount)}
      </p>

      <p className="mt-4 text-sm leading-6 text-slate-600">
        {getShortBio(doctor.bio)}
      </p>

      <dl className="mt-5 grid gap-3 text-sm">
        <div>
          <dt className="font-medium text-slate-700">Experience</dt>
          <dd className="mt-1 text-slate-600">
            {doctor.experienceYears
              ? `${doctor.experienceYears} years`
              : "Not specified"}
          </dd>
        </div>
        <div>
          <dt className="font-medium text-slate-700">Education</dt>
          <dd className="mt-1 text-slate-600">
            {doctor.education ?? "Not specified"}
          </dd>
        </div>
      </dl>

      <div className="mt-auto pt-5">
        <Link
          className="inline-flex min-h-10 w-full items-center justify-center rounded-md bg-teal-700 px-4 text-sm font-medium text-white transition hover:bg-teal-800"
          href={`/patient/doctors/${doctor.id}`}
        >
          View profile
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
        <p className="text-sm font-medium text-teal-700">Doctor directory</p>
        <h1 className="mt-3 text-3xl font-semibold tracking-normal text-slate-950">
          Find a doctor
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">
          Browse available doctor profiles by name, specialty, or symptom. Symptoms
          help suggest relevant specialties and do not replace medical advice.
        </p>
        <p className="mt-4 text-sm font-medium text-slate-700">
          {allDoctorCount} {allDoctorCount === 1 ? "doctor" : "doctors"} in the
          directory
        </p>
      </section>

      <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <form className="grid gap-4 lg:grid-cols-[1fr_240px_280px_auto]" action="/patient/doctors">
          <label className="block">
            <span className="text-sm font-medium text-slate-700">
              Search by doctor name
            </span>
            <input
              className="mt-2 min-h-11 w-full rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-teal-700 focus:ring-2 focus:ring-teal-100"
              defaultValue={query}
              name="q"
              placeholder="Enter doctor name"
              type="search"
            />
          </label>

          <label className="block">
            <span className="text-sm font-medium text-slate-700">
              Specialty
            </span>
            <select
              className="mt-2 min-h-11 w-full rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-950 outline-none transition focus:border-teal-700 focus:ring-2 focus:ring-teal-100"
              defaultValue={specialtySlug ?? ""}
              name="specialty"
            >
              <option value="">All specialties</option>
              {specialties.map((item) => (
                <option key={item.id} value={item.slug}>
                  {item.name}
                </option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="text-sm font-medium text-slate-700">
              Symptom helper
            </span>
            <select
              className="mt-2 min-h-11 w-full rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-950 outline-none transition focus:border-teal-700 focus:ring-2 focus:ring-teal-100"
              defaultValue={effectiveSymptomSlug ?? ""}
              name="symptom"
            >
              <option value="">All symptoms</option>
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
              Apply
            </button>
            {hasFilters ? (
              <Link
                className="inline-flex min-h-11 items-center justify-center rounded-md border border-slate-300 bg-white px-4 text-sm font-medium text-slate-700 transition hover:border-teal-700 hover:text-teal-700"
                href="/patient/doctors"
              >
                Clear
              </Link>
            ) : null}
          </div>
        </form>
      </section>

      <section className="rounded-lg border border-sky-100 bg-sky-50 p-4 shadow-sm">
        <p className="text-sm font-medium text-slate-950">
          Symptoms help suggest relevant specialties. This does not replace
          medical advice.
        </p>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          This directory filter is not diagnosis, AI triage, or emergency medical
          advice.
        </p>
        {selectedSymptom ? (
          <p className="mt-2 text-sm leading-6 text-slate-700">
            Selected symptom: {selectedSymptom.label}. Suggested specialties: {" "}
            {mappedSpecialtyNames.length > 0
              ? mappedSpecialtyNames.join(", ")
              : selectedSymptom.specialtySlugs.join(", ")}.
          </p>
        ) : null}
        {selectedSymptom?.emergencyNotice ? (
          <p className="mt-2 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm font-medium text-amber-900">
            If this is an emergency, seek urgent local medical care.
          </p>
        ) : null}
      </section>

      {doctors.length > 0 ? (
        <section
          aria-label="Doctor results"
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
              ? "No doctors are available yet"
              : "No doctors match these filters"}
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-slate-600">
            {allDoctorCount === 0
              ? "Doctor profiles will appear here after they are created."
              : "Try changing the doctor name, specialty, or symptom filter."}
          </p>
          {hasFilters ? (
            <Link
              className="mt-5 inline-flex min-h-10 items-center justify-center rounded-md border border-slate-300 bg-white px-4 text-sm font-medium text-slate-700 transition hover:border-teal-700 hover:text-teal-700"
                href={buildDirectoryHref({})}
            >
              Clear filters
            </Link>
          ) : null}
        </section>
      )}
    </div>
  );
}
