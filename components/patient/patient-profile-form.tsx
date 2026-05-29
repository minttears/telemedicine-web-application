"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

type PatientProfileFormProps = {
  initialValues: {
    dateOfBirth: string;
    gender: string;
    name: string;
  };
};

type ProfileResponse = {
  error?: string;
};

function isPastDate(value: string) {
  if (!value) {
    return true;
  }

  const date = new Date(`${value}T00:00:00.000Z`);

  return !Number.isNaN(date.getTime()) && date < new Date();
}

export function PatientProfileForm({
  initialValues,
}: PatientProfileFormProps) {
  const router = useRouter();
  const [name, setName] = useState(initialValues.name);
  const [dateOfBirth, setDateOfBirth] = useState(initialValues.dateOfBirth);
  const [gender, setGender] = useState(initialValues.gender);
  const [fieldError, setFieldError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const normalizedName = name.trim();
    const normalizedGender = gender.trim();

    setFieldError(null);
    setSubmitError(null);
    setSuccessMessage(null);

    if (normalizedName.length > 100) {
      setFieldError("Name is too long.");
      return;
    }

    if (dateOfBirth && !isPastDate(dateOfBirth)) {
      setFieldError("Enter a valid date of birth.");
      return;
    }

    if (normalizedGender.length > 50) {
      setFieldError("Gender value is too long.");
      return;
    }

    setIsPending(true);

    try {
      const response = await fetch("/api/patient/profile", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          dateOfBirth,
          gender: normalizedGender,
          name: normalizedName,
        }),
      });

      const result = (await response.json().catch(() => ({}))) as ProfileResponse;

      if (!response.ok) {
        setSubmitError(result.error ?? "Unable to update profile.");
        return;
      }

      setSuccessMessage("Profile updated.");
      router.refresh();
    } catch {
      setSubmitError("Unable to update profile right now.");
    } finally {
      setIsPending(false);
    }
  }

  return (
    <form
      className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm"
      onSubmit={handleSubmit}
    >
      <div>
        <p className="text-sm font-medium text-teal-700">Editable details</p>
        <h2 className="mt-2 text-xl font-semibold text-slate-950">
          Personal information
        </h2>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          Email, role, and account status are protected and cannot be changed
          here.
        </p>
      </div>

      <div className="mt-5 grid gap-5">
        <label className="block">
          <span className="text-sm font-medium text-slate-800">Name</span>
          <input
            autoComplete="name"
            className="mt-2 h-11 w-full rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-950 outline-none transition focus:border-teal-700 focus:ring-2 focus:ring-teal-100"
            maxLength={100}
            onChange={(event) => setName(event.target.value)}
            placeholder="Your full name"
            type="text"
            value={name}
          />
        </label>

        <label className="block">
          <span className="text-sm font-medium text-slate-800">
            Date of birth
          </span>
          <input
            className="mt-2 h-11 w-full rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-950 outline-none transition focus:border-teal-700 focus:ring-2 focus:ring-teal-100"
            max={new Date().toISOString().slice(0, 10)}
            onChange={(event) => setDateOfBirth(event.target.value)}
            type="date"
            value={dateOfBirth}
          />
        </label>

        <label className="block">
          <span className="text-sm font-medium text-slate-800">Gender</span>
          <input
            className="mt-2 h-11 w-full rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-950 outline-none transition focus:border-teal-700 focus:ring-2 focus:ring-teal-100"
            maxLength={50}
            onChange={(event) => setGender(event.target.value)}
            placeholder="Optional"
            type="text"
            value={gender}
          />
        </label>
      </div>

      {(fieldError || submitError) && (
        <p
          className="mt-5 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700"
          role="alert"
        >
          {fieldError ?? submitError}
        </p>
      )}

      {successMessage ? (
        <p className="mt-5 rounded-md border border-teal-200 bg-teal-50 px-3 py-2 text-sm text-teal-700">
          {successMessage}
        </p>
      ) : null}

      <div className="mt-6 flex justify-end">
        <button
          className="inline-flex min-h-11 items-center justify-center rounded-md bg-teal-700 px-4 text-sm font-medium text-white transition hover:bg-teal-800 disabled:cursor-not-allowed disabled:bg-slate-300"
          disabled={isPending}
          type="submit"
        >
          {isPending ? "Saving..." : "Save profile"}
        </button>
      </div>
    </form>
  );
}
