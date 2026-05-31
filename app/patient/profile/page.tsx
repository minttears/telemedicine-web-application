import { PatientProfileForm } from "@/components/patient/patient-profile-form";
import { ProfileImageUploadForm } from "@/components/profile/profile-image-upload-form";
import { requireWorkspaceRole } from "@/lib/auth/workspace";
import { prisma } from "@/lib/prisma";

function getInitials(name: string | null, email: string) {
  const source = name?.trim() || email;
  return source.slice(0, 2).toUpperCase();
}

function formatDate(value: Date | null | undefined) {
  if (!value) {
    return "Not specified";
  }

  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
  }).format(value);
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

export default async function PatientProfilePage() {
  const user = await requireWorkspaceRole("PATIENT");

  const patientProfile = await prisma.patientProfile.findUnique({
    where: {
      userId: user.id,
    },
    select: {
      dateOfBirth: true,
      gender: true,
    },
  });

  const dateOfBirthInputValue = patientProfile?.dateOfBirth
    ? patientProfile.dateOfBirth.toISOString().slice(0, 10)
    : "";

  return (
    <div className="space-y-6">
      <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-sm font-medium text-teal-700">Patient profile</p>
        <h1 className="mt-3 text-3xl font-semibold tracking-normal text-slate-950">
          Profile settings
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">
          Review your account details and update basic personal information used
          in your patient workspace.
        </p>
      </section>

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
              <FieldValue label="Role" value="Patient" />
              <FieldValue
                label="Account status"
                value={user.isActive ? "Active" : "Inactive"}
              />
              <FieldValue label="Name" value={user.name ?? "Not specified"} />
              <FieldValue
                label="Date of birth"
                value={formatDate(patientProfile?.dateOfBirth)}
              />
              <FieldValue
                label="Gender"
                value={patientProfile?.gender ?? "Not specified"}
              />
            </dl>
          </div>

          <ProfileImageUploadForm
            description="Your patient avatar is private to your patient workspace in this phase."
            endpoint="/api/patient/avatar"
            imageAlt="Patient avatar"
            imageSrc={
              user.avatarStoragePath
                ? `/api/profile-images/patient/${user.id}`
                : undefined
            }
            initials={getInitials(user.name, user.email)}
            title="Patient avatar"
          />
        </div>

        <PatientProfileForm
          initialValues={{
            dateOfBirth: dateOfBirthInputValue,
            gender: patientProfile?.gender ?? "",
            name: user.name ?? "",
          }}
        />
      </section>
    </div>
  );
}
