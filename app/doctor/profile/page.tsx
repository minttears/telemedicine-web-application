import { DoctorProfileForm } from "@/components/doctor/doctor-profile-form";
import { ProfileImageUploadForm } from "@/components/profile/profile-image-upload-form";
import { requireWorkspaceRole } from "@/lib/auth/workspace";
import { prisma } from "@/lib/prisma";

function getInitials(name: string | null, email: string) {
  const source = name?.trim() || email;
  return source.slice(0, 2).toUpperCase();
}

function FieldValue({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div>
      <dt className="text-sm font-medium text-slate-700">{label}</dt>
      <dd className="mt-1 break-words text-sm text-slate-600">{value}</dd>
    </div>
  );
}

export default async function DoctorProfilePage() {
  const user = await requireWorkspaceRole("DOCTOR");

  const doctorProfile = await prisma.doctorProfile.findUnique({
    where: {
      userId: user.id,
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
    },
  });

  return (
    <div className="space-y-6">
      <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-sm font-medium text-teal-700">Doctor profile</p>
        <h1 className="mt-3 text-3xl font-semibold tracking-normal text-slate-950">
          Profile settings
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">
          Review your account and public profile details. Admin-controlled
          account, specialty, experience, and booking settings are read-only.
        </p>
      </section>

      {!doctorProfile ? (
        <section className="rounded-lg border border-dashed border-slate-300 bg-white p-8 text-center">
          <h2 className="text-lg font-semibold text-slate-950">
            Doctor profile required
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-slate-600">
            Your doctor profile must be configured by an admin before profile
            settings can be edited.
          </p>
        </section>
      ) : (
        <section className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="space-y-6">
            <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="text-sm font-medium text-teal-700">Account</p>
                  <h2 className="mt-2 text-xl font-semibold text-slate-950">
                    Read-only details
                  </h2>
                </div>
                <span className="inline-flex w-fit rounded-full border border-teal-200 bg-teal-50 px-3 py-1 text-xs font-medium text-teal-700">
                  {user.isActive ? "Active" : "Inactive"}
                </span>
              </div>

              <dl className="mt-5 grid gap-4">
                <FieldValue label="Email" value={user.email} />
                <FieldValue label="Role" value="Doctor" />
                <FieldValue label="Name" value={user.name ?? "Not specified"} />
                <FieldValue
                  label="Specialty"
                  value={doctorProfile.specialty?.name ?? "Not assigned"}
                />
                <FieldValue
                  label="Experience"
                  value={
                    doctorProfile.experienceYears === null
                      ? "Not specified"
                      : `${doctorProfile.experienceYears} years`
                  }
                />
                <FieldValue
                  label="Account status"
                  value={user.isActive ? "Active" : "Inactive"}
                />
                <FieldValue
                  label="Available for booking"
                  value={doctorProfile.isAvailable ? "Available" : "Unavailable"}
                />
              </dl>
            </div>

            <ProfileImageUploadForm
              description="This professional photo is shown to patients in the doctor directory and profile pages."
              endpoint="/api/doctor/photo"
              imageAlt="Doctor profile photo"
              imageSrc={
                doctorProfile.photoStoragePath
                  ? `/api/profile-images/doctor/${doctorProfile.id}`
                  : undefined
              }
              initials={getInitials(user.name, user.email)}
              title="Professional photo"
            />
          </div>

          <DoctorProfileForm
            initialValues={{
              bio: doctorProfile.bio ?? "",
              education: doctorProfile.education ?? "",
              title: doctorProfile.title ?? "",
            }}
          />
        </section>
      )}
    </div>
  );
}
