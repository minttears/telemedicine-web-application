"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

type DoctorProfileFormProps = {
  initialValues: {
    bio: string;
    education: string;
    title: string;
  };
};

type ProfileResponse = {
  error?: string;
};

export function DoctorProfileForm({ initialValues }: DoctorProfileFormProps) {
  const router = useRouter();
  const [title, setTitle] = useState(initialValues.title);
  const [bio, setBio] = useState(initialValues.bio);
  const [education, setEducation] = useState(initialValues.education);
  const [fieldError, setFieldError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const normalizedTitle = title.trim();
    const normalizedBio = bio.trim();
    const normalizedEducation = education.trim();

    setFieldError(null);
    setSubmitError(null);
    setSuccessMessage(null);

    if (normalizedTitle.length > 120) {
      setFieldError("Title is too long.");
      return;
    }

    if (normalizedBio.length > 2000) {
      setFieldError("Bio is too long.");
      return;
    }

    if (normalizedEducation.length > 1000) {
      setFieldError("Education is too long.");
      return;
    }

    setIsPending(true);

    try {
      const response = await fetch("/api/doctor/profile", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          bio: normalizedBio,
          education: normalizedEducation,
          title: normalizedTitle,
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
          Public profile copy
        </h2>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          Specialty, experience, account status, and booking availability remain
          admin-controlled.
        </p>
      </div>

      <div className="mt-5 grid gap-5">
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
          <span className="text-sm font-medium text-slate-800">Bio</span>
          <textarea
            className="mt-2 min-h-36 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-950 outline-none transition focus:border-teal-700 focus:ring-2 focus:ring-teal-100"
            maxLength={2000}
            onChange={(event) => setBio(event.target.value)}
            placeholder="Short public doctor profile"
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
