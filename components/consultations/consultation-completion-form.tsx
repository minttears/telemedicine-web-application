"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

const MAX_DOCTOR_NOTES_LENGTH = 4000;

type ConsultationCompletionFormProps = {
  consultationId: string;
};

export function ConsultationCompletionForm({
  consultationId,
}: ConsultationCompletionFormProps) {
  const router = useRouter();
  const [doctorNotes, setDoctorNotes] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const trimmedDoctorNotes = doctorNotes.trim();

    if (trimmedDoctorNotes.length === 0) {
      setError("Conclusion and recommendations are required.");
      return;
    }

    if (trimmedDoctorNotes.length > MAX_DOCTOR_NOTES_LENGTH) {
      setError(
        `Conclusion and recommendations must be ${MAX_DOCTOR_NOTES_LENGTH} characters or fewer.`,
      );
      return;
    }

    setError(null);
    setIsSubmitting(true);

    try {
      const response = await fetch(
        `/api/consultations/${consultationId}/complete`,
        {
          body: JSON.stringify({
            doctorNotes: trimmedDoctorNotes,
          }),
          headers: {
            "Content-Type": "application/json",
          },
          method: "POST",
        },
      );

      const payload = (await response.json().catch(() => null)) as {
        error?: string;
      } | null;

      if (!response.ok) {
        setError(payload?.error ?? "Unable to complete consultation.");
        return;
      }

      setDoctorNotes("");
      router.refresh();
    } catch {
      setError("Unable to complete consultation.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
      <div>
        <p className="text-sm font-medium text-teal-700">
          Complete consultation
        </p>
        <h2 className="mt-2 text-lg font-semibold text-slate-950">
          Add conclusion and recommendations
        </h2>
        <p className="mt-3 text-sm leading-6 text-slate-600">
          This MVP note is plain text for the patient summary. A legal
          prescription workflow will be handled in a later phase.
        </p>
      </div>

      <form className="mt-5 space-y-3" onSubmit={handleSubmit}>
        <div>
          <label
            className="text-sm font-medium text-slate-700"
            htmlFor="doctorNotes"
          >
            Conclusion and recommendations
          </label>
          <textarea
            className="mt-2 min-h-40 w-full resize-y rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-teal-700 focus:ring-2 focus:ring-teal-100"
            disabled={isSubmitting}
            id="doctorNotes"
            name="doctorNotes"
            onChange={(event) => setDoctorNotes(event.target.value)}
            placeholder="Write the consultation conclusion and recommendations"
            value={doctorNotes}
          />
          <p className="mt-2 text-xs text-slate-500">
            {doctorNotes.trim().length}/{MAX_DOCTOR_NOTES_LENGTH} characters
          </p>
        </div>

        {error ? (
          <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </p>
        ) : null}

        <button
          className="inline-flex min-h-10 items-center justify-center rounded-md bg-teal-700 px-4 text-sm font-medium text-white transition hover:bg-teal-800 disabled:cursor-not-allowed disabled:bg-slate-300"
          disabled={isSubmitting}
          type="submit"
        >
          {isSubmitting ? "Completing" : "Complete consultation"}
        </button>
      </form>
    </section>
  );
}
