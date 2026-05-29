"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

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
      setFieldError("Name is required.");
      return;
    }

    if (normalizedName.length > 100) {
      setFieldError("Name is too long.");
      return;
    }

    if (!normalizedEmail || !isValidEmail(normalizedEmail)) {
      setFieldError("Enter a valid email address.");
      return;
    }

    if (normalizedEmail.length > 254) {
      setFieldError("Email address is too long.");
      return;
    }

    if (
      mode === "create" &&
      setupMethod === "temporaryPassword" &&
      temporaryPassword.length < 8
    ) {
      setFieldError("Temporary password must be at least 8 characters.");
      return;
    }

    if (!specialtyId) {
      setFieldError("Select an active specialty.");
      return;
    }

    if (
      !Number.isInteger(parsedExperienceYears) ||
      parsedExperienceYears < 0 ||
      parsedExperienceYears > 80
    ) {
      setFieldError("Experience years must be between 0 and 80.");
      return;
    }

    if (title.trim().length > 120) {
      setFieldError("Title is too long.");
      return;
    }

    if (bio.trim().length > 2000) {
      setFieldError("Bio is too long.");
      return;
    }

    if (education.trim().length > 1000) {
      setFieldError("Education is too long.");
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
        setSubmitError(result.error ?? "Unable to save doctor details.");
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
      setSubmitError("Unable to save doctor details right now.");
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
          Add or reactivate a specialty before creating or editing doctor
          assignments. Specialty management is outside this phase.
        </div>
      ) : null}

      {mode === "create" ? (
        <fieldset className="mb-5 rounded-lg border border-slate-200 bg-slate-50 p-4">
          <legend className="text-sm font-semibold text-slate-950">
            Account setup
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
                  Invite link
                </span>
                <span className="mt-1 block text-sm leading-6 text-slate-600">
                  Create an inactive doctor account and show a one-time setup
                  link for the doctor to set a password.
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
                  Temporary password
                </span>
                <span className="mt-1 block text-sm leading-6 text-slate-600">
                  Keep the existing fallback flow for manually coordinated
                  temporary passwords.
                </span>
              </span>
            </label>
          </div>
        </fieldset>
      ) : null}

      <div className="grid gap-5 lg:grid-cols-2">
        <label className="block">
          <span className="text-sm font-medium text-slate-800">Name</span>
          <input
            autoComplete="name"
            className="mt-2 h-11 w-full rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-950 outline-none transition focus:border-teal-700 focus:ring-2 focus:ring-teal-100"
            maxLength={100}
            onChange={(event) => setName(event.target.value)}
            placeholder="Doctor full name"
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
          <label className="block">
            <span className="text-sm font-medium text-slate-800">
              Temporary password
            </span>
            <input
              autoComplete="new-password"
              className="mt-2 h-11 w-full rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-950 outline-none transition focus:border-teal-700 focus:ring-2 focus:ring-teal-100"
              onChange={(event) => setTemporaryPassword(event.target.value)}
              type="password"
              value={temporaryPassword}
            />
            <span className="mt-2 block text-xs leading-5 text-slate-500">
              Use at least 8 characters. It will not be shown after creation.
            </span>
          </label>
        ) : null}

        <label className="block">
          <span className="text-sm font-medium text-slate-800">Title</span>
          <input
            className="mt-2 h-11 w-full rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-950 outline-none transition focus:border-teal-700 focus:ring-2 focus:ring-teal-100"
            maxLength={120}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="Consultant cardiologist"
            type="text"
            value={title}
          />
        </label>

        <label className="block">
          <span className="text-sm font-medium text-slate-800">Specialty</span>
          <select
            className="mt-2 h-11 w-full rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-950 outline-none transition focus:border-teal-700 focus:ring-2 focus:ring-teal-100"
            disabled={!hasSpecialties}
            onChange={(event) => setSpecialtyId(event.target.value)}
            value={specialtyId}
          >
            <option value="">Select specialty</option>
            {specialties.map((specialty) => (
              <option key={specialty.id} value={specialty.id}>
                {specialty.name}
              </option>
            ))}
          </select>
        </label>

        <label className="block">
          <span className="text-sm font-medium text-slate-800">
            Experience years
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
          <span className="text-sm font-medium text-slate-800">Bio</span>
          <textarea
            className="mt-2 min-h-36 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-950 outline-none transition focus:border-teal-700 focus:ring-2 focus:ring-teal-100"
            maxLength={2000}
            onChange={(event) => setBio(event.target.value)}
            placeholder="Short doctor profile"
            value={bio}
          />
        </label>

        <label className="block">
          <span className="text-sm font-medium text-slate-800">Education</span>
          <textarea
            className="mt-2 min-h-36 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-950 outline-none transition focus:border-teal-700 focus:ring-2 focus:ring-teal-100"
            maxLength={1000}
            onChange={(event) => setEducation(event.target.value)}
            placeholder="Degrees, certifications, and training"
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
              Account active
            </span>
            <span className="mt-1 block text-sm leading-6 text-slate-600">
              {mode === "create" && setupMethod === "invite"
                ? "Invite-created doctors start inactive until password setup is complete."
                : "Active doctors can sign in. Deactivated doctors cannot access the doctor workspace."}
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
              Available for booking
            </span>
            <span className="mt-1 block text-sm leading-6 text-slate-600">
              {mode === "create" && setupMethod === "invite"
                ? "Invite-created doctors stay unavailable for booking until an admin enables this later."
                : "Available doctors appear in the patient directory and can show bookable slots."}
            </span>
          </span>
        </label>
      </fieldset>

      {inviteDetails ? (
        <div className="mt-5 rounded-lg border border-teal-200 bg-teal-50 p-4">
          <h2 className="text-sm font-semibold text-teal-950">
            One-time invite link
          </h2>
          <p className="mt-2 text-sm leading-6 text-teal-900">
            Copy this link now and share it through an approved secure process.
            It will not be shown again after you leave this page.
          </p>
          <label className="mt-3 block">
            <span className="text-xs font-medium uppercase tracking-normal text-teal-900">
              Invite link
            </span>
            <input
              className="mt-2 w-full rounded-md border border-teal-200 bg-white px-3 py-2 text-sm text-slate-950"
              readOnly
              value={inviteDetails.url}
            />
          </label>
          <p className="mt-2 text-xs text-teal-900">
            Expires {new Date(inviteDetails.expiresAt).toLocaleString()}.
          </p>
          {inviteDetails.doctorId ? (
            <button
              className="mt-4 inline-flex min-h-10 items-center justify-center rounded-md border border-teal-300 bg-white px-4 text-sm font-medium text-teal-800 transition hover:border-teal-700 hover:text-teal-900"
              onClick={() => router.push(`/admin/doctors/${inviteDetails.doctorId}`)}
              type="button"
            >
              Open doctor details
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
          Cancel
        </button>
        <button
          className="inline-flex min-h-11 items-center justify-center rounded-md bg-teal-700 px-4 text-sm font-medium text-white transition hover:bg-teal-800 disabled:cursor-not-allowed disabled:bg-slate-300"
          disabled={isPending || !hasSpecialties}
          type="submit"
        >
          {isPending
            ? "Saving..."
            : mode === "create"
              ? setupMethod === "invite"
                ? "Create doctor invite"
                : "Create doctor"
              : "Save changes"}
        </button>
      </div>
    </form>
  );
}
