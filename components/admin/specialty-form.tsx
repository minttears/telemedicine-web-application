"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

type SpecialtyFormInitialValues = {
  description: string;
  isActive: boolean;
  name: string;
  slug: string;
};

type SpecialtyFormProps = {
  initialValues?: SpecialtyFormInitialValues;
  mode: "create" | "edit";
  specialtyId?: string;
};

type SpecialtyFormResponse = {
  error?: string;
  redirectTo?: string;
};

const defaultValues: SpecialtyFormInitialValues = {
  description: "",
  isActive: true,
  name: "",
  slug: "",
};

function createSlug(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 100);
}

function isValidSlug(value: string) {
  return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value);
}

export function SpecialtyForm({
  initialValues,
  mode,
  specialtyId,
}: SpecialtyFormProps) {
  const router = useRouter();
  const values = initialValues ?? defaultValues;
  const [name, setName] = useState(values.name);
  const [slug, setSlug] = useState(values.slug);
  const [description, setDescription] = useState(values.description);
  const [isActive, setIsActive] = useState(values.isActive);
  const [fieldError, setFieldError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);
  const [hasEditedSlug, setHasEditedSlug] = useState(mode === "edit");

  function handleNameChange(value: string) {
    setName(value);

    if (mode === "create" && !hasEditedSlug) {
      setSlug(createSlug(value));
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const normalizedName = name.trim();
    const normalizedSlug = slug.trim().toLowerCase();
    const normalizedDescription = description.trim();

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

    if (!normalizedSlug) {
      setFieldError("Slug is required.");
      return;
    }

    if (normalizedSlug.length > 100) {
      setFieldError("Slug is too long.");
      return;
    }

    if (!isValidSlug(normalizedSlug)) {
      setFieldError(
        "Slug must use lowercase letters, numbers, and hyphens without leading or trailing hyphens.",
      );
      return;
    }

    if (normalizedDescription.length > 1000) {
      setFieldError("Description is too long.");
      return;
    }

    setIsPending(true);

    try {
      const response = await fetch(
        mode === "create"
          ? "/api/admin/specialties"
          : `/api/admin/specialties/${specialtyId}`,
        {
          method: mode === "create" ? "POST" : "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            description: normalizedDescription,
            isActive,
            name: normalizedName,
            slug: normalizedSlug,
          }),
        },
      );

      const result = (await response.json().catch(() => ({}))) as SpecialtyFormResponse;

      if (!response.ok) {
        setSubmitError(result.error ?? "Unable to save specialty details.");
        return;
      }

      router.push(result.redirectTo ?? "/admin/specialties");
      router.refresh();
    } catch {
      setSubmitError("Unable to save specialty details right now.");
    } finally {
      setIsPending(false);
    }
  }

  return (
    <form
      className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm"
      onSubmit={handleSubmit}
    >
      <div className="grid gap-5 lg:grid-cols-2">
        <label className="block">
          <span className="text-sm font-medium text-slate-800">Name</span>
          <input
            className="mt-2 h-11 w-full rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-950 outline-none transition focus:border-teal-700 focus:ring-2 focus:ring-teal-100"
            maxLength={100}
            onChange={(event) => handleNameChange(event.target.value)}
            placeholder="Cardiology"
            type="text"
            value={name}
          />
        </label>

        <label className="block">
          <span className="text-sm font-medium text-slate-800">Slug</span>
          <input
            className="mt-2 h-11 w-full rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-950 outline-none transition focus:border-teal-700 focus:ring-2 focus:ring-teal-100"
            maxLength={100}
            onChange={(event) => {
              setHasEditedSlug(true);
              setSlug(event.target.value.toLowerCase());
            }}
            placeholder="cardiology"
            type="text"
            value={slug}
          />
          <span className="mt-2 block text-xs leading-5 text-amber-700">
            Changing a slug can break old doctor filter URLs that used the
            previous slug.
          </span>
        </label>
      </div>

      <label className="mt-5 block">
        <span className="text-sm font-medium text-slate-800">Description</span>
        <textarea
          className="mt-2 min-h-32 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-950 outline-none transition focus:border-teal-700 focus:ring-2 focus:ring-teal-100"
          maxLength={1000}
          onChange={(event) => setDescription(event.target.value)}
          placeholder="Short specialty description"
          value={description}
        />
      </label>

      <label className="mt-5 flex items-start gap-3 rounded-lg border border-slate-200 bg-slate-50 p-4">
        <input
          checked={isActive}
          className="mt-1 h-4 w-4 accent-teal-700"
          onChange={(event) => setIsActive(event.target.checked)}
          type="checkbox"
        />
        <span>
          <span className="block text-sm font-medium text-slate-900">
            Active
          </span>
          <span className="mt-1 block text-sm leading-6 text-slate-600">
            Active specialties can be assigned to doctors and appear in patient
            directory filters.
          </span>
        </span>
      </label>

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
          onClick={() => router.push("/admin/specialties")}
          type="button"
        >
          Cancel
        </button>
        <button
          className="inline-flex min-h-11 items-center justify-center rounded-md bg-teal-700 px-4 text-sm font-medium text-white transition hover:bg-teal-800 disabled:cursor-not-allowed disabled:bg-slate-300"
          disabled={isPending}
          type="submit"
        >
          {isPending
            ? "Saving..."
            : mode === "create"
              ? "Create specialty"
              : "Save changes"}
        </button>
      </div>
    </form>
  );
}
