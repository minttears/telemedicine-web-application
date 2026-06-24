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
    return "Не указано";
  }

  return new Intl.DateTimeFormat("ru-RU", {
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
        <p className="text-sm font-medium text-teal-700">Профиль пациента</p>
        <h1 className="mt-3 text-3xl font-semibold tracking-normal text-slate-950">
          Настройки профиля
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">
          Проверьте данные аккаунта и обновите основную личную информацию,
          используемую в кабинете пациента.
        </p>
      </section>

      <section className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="space-y-6">
          <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="text-sm font-medium text-teal-700">Аккаунт</p>
                <h2 className="mt-2 text-xl font-semibold text-slate-950">
                  Данные только для просмотра
                </h2>
              </div>
              <span className="inline-flex w-fit rounded-full border border-teal-200 bg-teal-50 px-3 py-1 text-xs font-medium text-teal-700">
                {user.isActive ? "Активен" : "Неактивен"}
              </span>
            </div>

            <dl className="mt-5 grid gap-4">
              <FieldValue label="Email" value={user.email} />
              <FieldValue label="Роль" value="Пациент" />
              <FieldValue
                label="Статус аккаунта"
                value={user.isActive ? "Активен" : "Неактивен"}
              />
              <FieldValue label="Имя" value={user.name ?? "Не указано"} />
              <FieldValue
                label="Дата рождения"
                value={formatDate(patientProfile?.dateOfBirth)}
              />
              <FieldValue
                label="Пол"
                value={patientProfile?.gender ?? "Не указано"}
              />
            </dl>
          </div>

          <ProfileImageUploadForm
            description="Ваш аватар доступен только в защищённых разделах приложения."
            endpoint="/api/patient/avatar"
            imageAlt="Аватар пациента"
            imageSrc={
              user.avatarStoragePath
                ? `/api/profile-images/patient/${user.id}`
                : undefined
            }
            initials={getInitials(user.name, user.email)}
            title="Аватар пациента"
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
