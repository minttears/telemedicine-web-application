import Link from "next/link";
import { notFound } from "next/navigation";

import { DoctorForm } from "@/components/admin/doctor-form";
import { DoctorInviteAction } from "@/components/admin/doctor-invite-action";
import { DoctorPasswordResetAction } from "@/components/admin/doctor-password-reset-action";
import { DoctorTwoFactorResetAction } from "@/components/admin/doctor-two-factor-reset-action";
import { ProfileImage } from "@/components/profile/profile-image";
import { prisma } from "@/lib/prisma";

type AdminDoctorDetailPageProps = {
  params: Promise<{
    doctorId: string;
  }>;
  searchParams: Promise<{
    created?: string;
    updated?: string;
  }>;
};

function formatDateTime(value: Date) {
  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(value);
}

function getStatusClassName(isEnabled: boolean) {
  return isEnabled
    ? "border-teal-200 bg-teal-50 text-teal-700"
    : "border-slate-200 bg-slate-100 text-slate-600";
}

function getInitials(name: string | null) {
  return (name ?? "DR").slice(0, 2).toUpperCase();
}

export default async function AdminDoctorDetailPage({
  params,
  searchParams,
}: AdminDoctorDetailPageProps) {
  const { doctorId } = await params;
  const { created, updated } = await searchParams;

  const [doctor, activeSpecialties] = await Promise.all([
    prisma.doctorProfile.findFirst({
      where: {
        id: doctorId,
        user: {
          role: "DOCTOR",
        },
      },
      include: {
        specialty: {
          select: {
            name: true,
          },
        },
        user: {
          select: {
            createdAt: true,
            email: true,
            id: true,
            isActive: true,
            name: true,
            passwordChangedAt: true,
            role: true,
            twoFactorSecret: {
              select: {
                enabledAt: true,
              },
            },
            updatedAt: true,
          },
        },
      },
    }),
    prisma.specialty.findMany({
      where: {
        isActive: true,
      },
      orderBy: {
        name: "asc",
      },
      select: {
        id: true,
        name: true,
      },
    }),
  ]);

  if (!doctor) {
    notFound();
  }

  const currentInactiveSpecialty =
    doctor.specialty && !activeSpecialties.some((item) => item.id === doctor.specialtyId)
      ? {
          id: doctor.specialtyId ?? "",
          name: `${doctor.specialty.name} (inactive)`,
        }
      : null;
  const specialties = currentInactiveSpecialty
    ? [currentInactiveSpecialty, ...activeSpecialties]
    : activeSpecialties;
  const canGenerateInvite =
    doctor.user.passwordChangedAt === null && !doctor.user.isActive;

  return (
    <div className="space-y-6">
      <Link
        className="inline-flex min-h-10 items-center rounded-md border border-slate-300 bg-white px-3 text-sm font-medium text-slate-700 transition hover:border-teal-700 hover:text-teal-700"
        href="/admin/doctors"
      >
        Back to doctors
      </Link>

      {created ? (
        <p className="rounded-md border border-teal-200 bg-teal-50 px-4 py-3 text-sm text-teal-800">
          Doctor account created. The temporary password is not displayed.
        </p>
      ) : null}

      {updated ? (
        <p className="rounded-md border border-teal-200 bg-teal-50 px-4 py-3 text-sm text-teal-800">
          Doctor details updated.
        </p>
      ) : null}

      <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
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
              <p className="mt-2 text-sm text-slate-600">{doctor.user.email}</p>
              {doctor.title ? (
                <p className="mt-2 text-sm text-slate-600">{doctor.title}</p>
              ) : null}
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <span
              className={`inline-flex rounded-full border px-3 py-1 text-xs font-medium ${getStatusClassName(
                doctor.user.isActive,
              )}`}
            >
              Account {doctor.user.isActive ? "active" : "inactive"}
            </span>
            <span
              className={`inline-flex rounded-full border px-3 py-1 text-xs font-medium ${getStatusClassName(
                doctor.isAvailable,
              )}`}
            >
              Booking {doctor.isAvailable ? "available" : "unavailable"}
            </span>
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-medium text-slate-600">Role</p>
          <p className="mt-2 text-lg font-semibold text-slate-950">
            {doctor.user.role}
          </p>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-medium text-slate-600">Experience</p>
          <p className="mt-2 text-lg font-semibold text-slate-950">
            {doctor.experienceYears ?? 0} years
          </p>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-medium text-slate-600">Created</p>
          <p className="mt-2 text-sm font-semibold text-slate-950">
            {formatDateTime(doctor.user.createdAt)}
          </p>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-medium text-slate-600">Updated</p>
          <p className="mt-2 text-sm font-semibold text-slate-950">
            {formatDateTime(doctor.updatedAt)}
          </p>
        </div>
      </section>

      <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-xl font-semibold text-slate-950">Edit doctor</h2>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          Update basic account and profile fields. Schedule
          management, consultation content, and file access are outside this
          phase.
        </p>
        <div className="mt-5">
          <DoctorForm
            doctorId={doctor.id}
            initialValues={{
              bio: doctor.bio ?? "",
              education: doctor.education ?? "",
              email: doctor.user.email,
              experienceYears: doctor.experienceYears ?? 0,
              isActive: doctor.user.isActive,
              isAvailable: doctor.isAvailable,
              name: doctor.user.name ?? "",
              specialtyId: doctor.specialtyId ?? "",
              title: doctor.title ?? "",
            }}
            mode="edit"
            specialties={specialties}
          />
        </div>
      </section>

      {canGenerateInvite ? (
        <DoctorInviteAction doctorId={doctor.id} />
      ) : (
        <DoctorPasswordResetAction doctorId={doctor.id} />
      )}

      <DoctorTwoFactorResetAction
        doctorId={doctor.id}
        initialEnabled={Boolean(doctor.user.twoFactorSecret?.enabledAt)}
      />
    </div>
  );
}
