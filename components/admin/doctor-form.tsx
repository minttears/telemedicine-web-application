"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

import { PasswordField } from "@/components/auth/password-field";

type SpecialtyOption = {
  id: string;
  name: string;
};

type DoctorFormInitialValues = {
  bio: string;
  education: string;
  email: string;
  experienceYears: number;
  isActive: boolean;
  isAvailable: boolean;
  name: string;
  specialtyId: string;
  title: string;
};

type DoctorFormProps = {
  doctorId?: string;
  initialValues?: DoctorFormInitialValues;
  mode: "create" | "edit";
  specialties: SpecialtyOption[];
};

type DoctorFormResponse = {
  error?: string;
  doctorId?: string;
  inviteExpiresAt?: string;
  inviteUrl?: string;
  redirectTo?: string;
};

type SetupMethod = "invite" | "temporaryPassword";

const defaultValues: DoctorFormInitialValues = {
  bio: "",
  education: "",
  email: "",
  experienceYears: 0,
  isActive: true,
  isAvailable: true,
  name: "",
  specialtyId: "",
  title: "",
};

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export function DoctorForm({
  doctorId,
  initialValues,
  mode,
  specialties,
}: DoctorFormProps) {
  const router = useRouter();
  const values = initialValues ?? defaultValues;
  const [setupMethod, setSetupMethod] = useState<SetupMethod>("invite");
  const [name, setName] = useState(values.name);
  const [email, setEmail] = useState(values.email);
  const [temporaryPassword, setTemporaryPassword] = useState("");
  const [title, setTitle] = useState(values.title);
  const [specialtyId, setSpecialtyId] = useState(values.specialtyId);
  const [bio, setBio] = useState(values.bio);
  const [education, setEducation] = useState(values.education);
  const [experienceYears, setExperienceYears] = useState(
    String(values.experienceYears),
  );
  const [isActive, setIsActive] = useState(values.isActive);
  const [isAvailable, setIsAvailable] = useState(values.isAvailable);
  const [fieldError, setFieldError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [inviteDetails, setInviteDetails] = useState<{
    doctorId: string;
    expiresAt: string;
    url: string;
  } | null>(null);
  const [isPending, setIsPending] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const normalizedName = name.trim();
    const normalizedEmail = email.trim().toLowerCase();
    const parsedExperienceYears = Number(experienceYears);

    setFieldError(null);
    setSubmitError(null);

    if (!normalizedName) {
      setFieldError("Укажите имя врача.");
      return;
    }

    if (normalizedName.length > 100) {
      setFieldError("Имя врача слишком длинное.");
      return;
    }

    if (!normalizedEmail || !isValidEmail(normalizedEmail)) {
      setFieldError("Введите корректный email.");
      return;
    }

    if (normalizedEmail.length > 254) {
      setFieldError("Email слишком длинный.");
      return;
    }

    if (
      mode === "create" &&
      setupMethod === "temporaryPassword" &&
      temporaryPassword.length < 8
    ) {
      setFieldError("Временный пароль должен содержать не менее 8 символов.");
      return;
    }

    if (!specialtyId) {
      setFieldError("Выберите активную специальность.");
      return;
    }

    if (
      !Number.isInteger(parsedExperienceYears) ||
      parsedExperienceYears < 0 ||
      parsedExperienceYears > 80
    ) {
      setFieldError("Стаж должен быть от 0 до 80 лет.");
      return;
    }

    if (title.trim().length > 120) {
      setFieldError("Название должности слишком длинное.");
      return;
    }

    if (bio.trim().length > 2000) {
      setFieldError("Описание врача слишком длинное.");
      return;
    }

    if (education.trim().length > 1000) {
      setFieldError("Сведения об образовании слишком длинные.");
      return;
    }

    setIsPending(true);

    try {
      setInviteDetails(null);

      const response = await fetch(
        mode === "create"
          ? "/api/admin/doctors"
          : `/api/admin/doctors/${doctorId}`,
        {
          method: mode === "create" ? "POST" : "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            bio: bio.trim(),
            education: education.trim(),
            email: normalizedEmail,
            experienceYears: parsedExperienceYears,
            isActive,
            isAvailable,
            name: normalizedName,
            setupMethod: mode === "create" ? setupMethod : undefined,
            specialtyId,
            temporaryPassword:
              mode === "create" && setupMethod === "temporaryPassword"
                ? temporaryPassword
                : undefined,
            title: title.trim(),
          }),
        },
      );

      const result = (await response.json().catch(() => ({}))) as DoctorFormResponse;

      if (!response.ok) {
        setSubmitError(result.error ?? "Не удалось сохранить данные врача.");
        return;
      }

      if (mode === "create" && result.inviteUrl && result.inviteExpiresAt) {
        setInviteDetails({
          doctorId: result.doctorId ?? "",
          expiresAt: result.inviteExpiresAt,
          url: result.inviteUrl,
        });
        return;
      }

      router.push(result.redirectTo ?? "/admin/doctors");
      router.refresh();
    } catch {
      setSubmitError("Сейчас не удалось сохранить данные врача.");
    } finally {
      setIsPending(false);
    }
  }

  const hasSpecialties = specialties.length > 0;

  return (
    <form
      className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm"
      onSubmit={handleSubmit}
    >
      {!hasSpecialties ? (
        <div className="rounded-md border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-800">
          Добавьте или повторно активируйте специальность перед созданием или
          редактированием врача.
        </div>
      ) : null}

      {mode === "create" ? (
        <fieldset className="mb-5 rounded-lg border border-slate-200 bg-slate-50 p-4">
          <legend className="text-sm font-semibold text-slate-950">
            Настройка учётной записи
          </legend>
          <div className="mt-3 grid gap-3 lg:grid-cols-2">
            <label className="flex items-start gap-3 rounded-md border border-teal-200 bg-white p-4">
              <input
                checked={setupMethod === "invite"}
                className="mt-1 h-4 w-4 accent-teal-700"
                onChange={() => setSetupMethod("invite")}
                type="radio"
              />
              <span>
                <span className="block text-sm font-medium text-slate-900">
                  Ссылка-приглашение
                </span>
                <span className="mt-1 block text-sm leading-6 text-slate-600">
                  Создать неактивную учётную запись и показать одноразовую
                  ссылку, по которой врач задаст пароль.
                </span>
              </span>
            </label>
            <label className="flex items-start gap-3 rounded-md border border-slate-200 bg-white p-4">
              <input
                checked={setupMethod === "temporaryPassword"}
                className="mt-1 h-4 w-4 accent-teal-700"
                onChange={() => setSetupMethod("temporaryPassword")}
                type="radio"
              />
              <span>
                <span className="block text-sm font-medium text-slate-900">
                  Временный пароль
                </span>
                <span className="mt-1 block text-sm leading-6 text-slate-600">
                  Использовать резервный вариант с временным паролем,
                  передаваемым врачу согласованным способом.
                </span>
              </span>
            </label>
          </div>
        </fieldset>
      ) : null}

      <div className="grid gap-5 lg:grid-cols-2">
        <label className="block">
          <span className="text-sm font-medium text-slate-800">Имя врача</span>
          <input
            autoComplete="name"
            className="mt-2 h-11 w-full rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-950 outline-none transition focus:border-teal-700 focus:ring-2 focus:ring-teal-100"
            maxLength={100}
            onChange={(event) => setName(event.target.value)}
            placeholder="Фамилия, имя и отчество"
            type="text"
            value={name}
          />
        </label>

        <label className="block">
          <span className="text-sm font-medium text-slate-800">Email</span>
          <input
            autoComplete="email"
            className="mt-2 h-11 w-full rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-950 outline-none transition focus:border-teal-700 focus:ring-2 focus:ring-teal-100"
            inputMode="email"
            onChange={(event) => setEmail(event.target.value)}
            placeholder="doctor@example.com"
            type="email"
            value={email}
          />
        </label>

        {mode === "create" && setupMethod === "temporaryPassword" ? (
          <PasswordField
            autoComplete="new-password"
            helpText="Используйте не менее 8 символов. После создания пароль не будет показан."
            id="temporaryPassword"
            label="Временный пароль"
            onChange={setTemporaryPassword}
            value={temporaryPassword}
          />
        ) : null}

        <label className="block">
          <span className="text-sm font-medium text-slate-800">Должность</span>
          <input
            className="mt-2 h-11 w-full rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-950 outline-none transition focus:border-teal-700 focus:ring-2 focus:ring-teal-100"
            maxLength={120}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="Врач-кардиолог"
            type="text"
            value={title}
          />
        </label>

        <label className="block">
          <span className="text-sm font-medium text-slate-800">
            Специальность
          </span>
          <select
            className="mt-2 h-11 w-full rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-950 outline-none transition focus:border-teal-700 focus:ring-2 focus:ring-teal-100"
            disabled={!hasSpecialties}
            onChange={(event) => setSpecialtyId(event.target.value)}
            value={specialtyId}
          >
            <option value="">Выберите специальность</option>
            {specialties.map((specialty) => (
              <option key={specialty.id} value={specialty.id}>
                {specialty.name}
              </option>
            ))}
          </select>
        </label>

        <label className="block">
          <span className="text-sm font-medium text-slate-800">
            Стаж, лет
          </span>
          <input
            className="mt-2 h-11 w-full rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-950 outline-none transition focus:border-teal-700 focus:ring-2 focus:ring-teal-100"
            max={80}
            min={0}
            onChange={(event) => setExperienceYears(event.target.value)}
            type="number"
            value={experienceYears}
          />
        </label>
      </div>

      <div className="mt-5 grid gap-5 lg:grid-cols-2">
        <label className="block">
          <span className="text-sm font-medium text-slate-800">
            Описание врача
          </span>
          <textarea
            className="mt-2 min-h-36 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-950 outline-none transition focus:border-teal-700 focus:ring-2 focus:ring-teal-100"
            maxLength={2000}
            onChange={(event) => setBio(event.target.value)}
            placeholder="Краткая информация о враче"
            value={bio}
          />
        </label>

        <label className="block">
          <span className="text-sm font-medium text-slate-800">Образование</span>
          <textarea
            className="mt-2 min-h-36 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-950 outline-none transition focus:border-teal-700 focus:ring-2 focus:ring-teal-100"
            maxLength={1000}
            onChange={(event) => setEducation(event.target.value)}
            placeholder="Образование, сертификаты и повышение квалификации"
            value={education}
          />
        </label>
      </div>

      <fieldset className="mt-5 grid gap-4 lg:grid-cols-2">
        <label className="flex items-start gap-3 rounded-lg border border-slate-200 bg-slate-50 p-4">
          <input
            checked={mode === "create" && setupMethod === "invite" ? false : isActive}
            className="mt-1 h-4 w-4 accent-teal-700"
            disabled={mode === "create" && setupMethod === "invite"}
            onChange={(event) => setIsActive(event.target.checked)}
            type="checkbox"
          />
          <span>
            <span className="block text-sm font-medium text-slate-900">
              Учётная запись активна
            </span>
            <span className="mt-1 block text-sm leading-6 text-slate-600">
              {mode === "create" && setupMethod === "invite"
                ? "Учётная запись по приглашению остаётся неактивной до завершения настройки пароля."
                : "Активный врач может войти в систему. Деактивированный врач не имеет доступа к рабочему пространству."}
            </span>
          </span>
        </label>

        <label className="flex items-start gap-3 rounded-lg border border-slate-200 bg-slate-50 p-4">
          <input
            checked={
              mode === "create" && setupMethod === "invite" ? false : isAvailable
            }
            className="mt-1 h-4 w-4 accent-teal-700"
            disabled={mode === "create" && setupMethod === "invite"}
            onChange={(event) => setIsAvailable(event.target.checked)}
            type="checkbox"
          />
          <span>
            <span className="block text-sm font-medium text-slate-900">
              Доступен для записи
            </span>
            <span className="mt-1 block text-sm leading-6 text-slate-600">
              {mode === "create" && setupMethod === "invite"
                ? "Врач, созданный по приглашению, недоступен для записи, пока администратор не включит эту возможность."
                : "Доступные врачи отображаются в каталоге пациентов и могут публиковать интервалы для записи."}
            </span>
          </span>
        </label>
      </fieldset>

      {inviteDetails ? (
        <div className="mt-5 rounded-lg border border-teal-200 bg-teal-50 p-4">
          <h2 className="text-sm font-semibold text-teal-950">
            Одноразовая ссылка-приглашение
          </h2>
          <p className="mt-2 text-sm leading-6 text-teal-900">
            Скопируйте ссылку сейчас и передайте её по согласованному
            защищённому каналу. После ухода со страницы ссылка больше не будет
            показана.
          </p>
          <label className="mt-3 block">
            <span className="text-xs font-medium uppercase tracking-normal text-teal-900">
              Ссылка-приглашение
            </span>
            <input
              className="mt-2 w-full rounded-md border border-teal-200 bg-white px-3 py-2 text-sm text-slate-950"
              readOnly
              value={inviteDetails.url}
            />
          </label>
          <p className="mt-2 text-xs text-teal-900">
            Действует до{" "}
            {new Date(inviteDetails.expiresAt).toLocaleString("ru-RU")}.
          </p>
          {inviteDetails.doctorId ? (
            <button
              className="mt-4 inline-flex min-h-10 items-center justify-center rounded-md border border-teal-300 bg-white px-4 text-sm font-medium text-teal-800 transition hover:border-teal-700 hover:text-teal-900"
              onClick={() => router.push(`/admin/doctors/${inviteDetails.doctorId}`)}
              type="button"
            >
              Открыть карточку врача
            </button>
          ) : null}
        </div>
      ) : null}

      {(fieldError || submitError) && (
        <p
          className="mt-5 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700"
          role="alert"
        >
          {fieldError ?? submitError}
        </p>
      )}

      <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <button
          className="inline-flex min-h-11 items-center justify-center rounded-md border border-slate-300 bg-white px-4 text-sm font-medium text-slate-700 transition hover:border-teal-700 hover:text-teal-700"
          onClick={() => router.push("/admin/doctors")}
          type="button"
        >
          Отмена
        </button>
        <button
          className="inline-flex min-h-11 items-center justify-center rounded-md bg-teal-700 px-4 text-sm font-medium text-white transition hover:bg-teal-800 disabled:cursor-not-allowed disabled:bg-slate-300"
          disabled={isPending || !hasSpecialties}
          type="submit"
        >
          {isPending
            ? "Сохранение..."
            : mode === "create"
              ? setupMethod === "invite"
                ? "Создать приглашение врача"
                : "Добавить врача"
              : "Сохранить изменения"}
        </button>
      </div>
    </form>
  );
}
