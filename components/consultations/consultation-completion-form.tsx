"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

const MAX_DOCTOR_NOTES_LENGTH = 4000;
const MAX_LONG_OUTCOME_FIELD_LENGTH = 4000;
const MAX_SHORT_OUTCOME_FIELD_LENGTH = 2000;

const diagnosisStatusOptions = [
  { label: "No diagnosis identified", value: "NOT_IDENTIFIED" },
  {
    label: "Requires further examination",
    value: "REQUIRES_FURTHER_EXAMINATION",
  },
  { label: "Preliminary diagnosis", value: "PRELIMINARY" },
  { label: "Confirmed diagnosis", value: "CONFIRMED" },
  { label: "Cannot determine online", value: "CANNOT_DETERMINE_ONLINE" },
];

type ConsultationCompletionFormProps = {
  consultationId: string;
};

export function ConsultationCompletionForm({
  consultationId,
}: ConsultationCompletionFormProps) {
  const router = useRouter();
  const [additionalNotes, setAdditionalNotes] = useState("");
  const [diagnosisDetails, setDiagnosisDetails] = useState("");
  const [diagnosisStatus, setDiagnosisStatus] = useState("");
  const [doctorNotes, setDoctorNotes] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [followUpInstructions, setFollowUpInstructions] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [medicationNotes, setMedicationNotes] = useState("");
  const [recommendations, setRecommendations] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const trimmedDoctorNotes = doctorNotes.trim();

    if (trimmedDoctorNotes.length === 0) {
      setError("Conclusion and recommendations are required.");
      return;
    }

    if (trimmedDoctorNotes.length > MAX_DOCTOR_NOTES_LENGTH) {
      setError(
        `Conclusion / summary must be ${MAX_DOCTOR_NOTES_LENGTH} characters or fewer.`,
      );
      return;
    }

    if (!diagnosisStatus) {
      setError("Select a diagnosis status.");
      return;
    }

    const optionalFields = [
      {
        label: "Diagnosis details",
        maxLength: MAX_SHORT_OUTCOME_FIELD_LENGTH,
        value: diagnosisDetails.trim(),
      },
      {
        label: "Doctor recommendations",
        maxLength: MAX_LONG_OUTCOME_FIELD_LENGTH,
        value: recommendations.trim(),
      },
      {
        label: "Medication notes",
        maxLength: MAX_SHORT_OUTCOME_FIELD_LENGTH,
        value: medicationNotes.trim(),
      },
      {
        label: "Follow-up instructions",
        maxLength: MAX_SHORT_OUTCOME_FIELD_LENGTH,
        value: followUpInstructions.trim(),
      },
      {
        label: "Additional notes",
        maxLength: MAX_SHORT_OUTCOME_FIELD_LENGTH,
        value: additionalNotes.trim(),
      },
    ];

    for (const field of optionalFields) {
      if (field.value.length > field.maxLength) {
        setError(`${field.label} must be ${field.maxLength} characters or fewer.`);
        return;
      }
    }

    setError(null);
    setIsSubmitting(true);

    try {
      const response = await fetch(
        `/api/consultations/${consultationId}/complete`,
        {
          body: JSON.stringify({
            additionalNotes: additionalNotes.trim(),
            diagnosisDetails: diagnosisDetails.trim(),
            diagnosisStatus,
            doctorNotes: trimmedDoctorNotes,
            followUpInstructions: followUpInstructions.trim(),
            medicationNotes: medicationNotes.trim(),
            recommendations: recommendations.trim(),
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
      setDiagnosisStatus("");
      setDiagnosisDetails("");
      setRecommendations("");
      setMedicationNotes("");
      setFollowUpInstructions("");
      setAdditionalNotes("");
      router.refresh();
    } catch (error) {
      if (process.env.NODE_ENV !== "production") {
        console.error("Consultation completion request failed", error);
      }

      setError(
        process.env.NODE_ENV === "production"
          ? "Unable to complete consultation."
          : error instanceof Error
            ? error.message
            : "Unable to complete consultation.",
      );
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
          Add consultation outcome
        </h2>
        <p className="mt-3 text-sm leading-6 text-slate-600">
          Record a treatment plan and doctor recommendations for this completed
          visit. Medication notes are informational outcome notes for this MVP.
        </p>
      </div>

      <form className="mt-5 space-y-5" onSubmit={handleSubmit}>
        <div>
          <label
            className="text-sm font-medium text-slate-700"
            htmlFor="doctorNotes"
          >
            Conclusion / summary
          </label>
          <textarea
            className="mt-2 min-h-40 w-full resize-y rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-teal-700 focus:ring-2 focus:ring-teal-100"
            disabled={isSubmitting}
            id="doctorNotes"
            name="doctorNotes"
            onChange={(event) => setDoctorNotes(event.target.value)}
            placeholder="Write the consultation conclusion or summary"
            value={doctorNotes}
          />
          <p className="mt-2 text-xs text-slate-500">
            {doctorNotes.trim().length}/{MAX_DOCTOR_NOTES_LENGTH} characters
          </p>
        </div>

        <div>
          <label
            className="text-sm font-medium text-slate-700"
            htmlFor="diagnosisStatus"
          >
            Diagnosis status
          </label>
          <select
            className="mt-2 min-h-11 w-full rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-950 outline-none transition focus:border-teal-700 focus:ring-2 focus:ring-teal-100"
            disabled={isSubmitting}
            id="diagnosisStatus"
            name="diagnosisStatus"
            onChange={(event) => setDiagnosisStatus(event.target.value)}
            value={diagnosisStatus}
          >
            <option value="">Select diagnosis status</option>
            {diagnosisStatusOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <p className="mt-2 text-xs text-slate-500">
            Choose No diagnosis identified or Requires further examination when
            a precise diagnosis is not possible.
          </p>
        </div>

        <div>
          <label
            className="text-sm font-medium text-slate-700"
            htmlFor="diagnosisDetails"
          >
            Diagnosis details optional
          </label>
          <textarea
            className="mt-2 min-h-28 w-full resize-y rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-teal-700 focus:ring-2 focus:ring-teal-100"
            disabled={isSubmitting}
            id="diagnosisDetails"
            name="diagnosisDetails"
            onChange={(event) => setDiagnosisDetails(event.target.value)}
            placeholder="Add details only when clinically appropriate"
            value={diagnosisDetails}
          />
          <p className="mt-2 text-xs text-slate-500">
            {diagnosisDetails.trim().length}/{MAX_SHORT_OUTCOME_FIELD_LENGTH} characters
          </p>
        </div>

        <div>
          <label
            className="text-sm font-medium text-slate-700"
            htmlFor="recommendations"
          >
            Doctor recommendations optional
          </label>
          <textarea
            className="mt-2 min-h-32 w-full resize-y rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-teal-700 focus:ring-2 focus:ring-teal-100"
            disabled={isSubmitting}
            id="recommendations"
            name="recommendations"
            onChange={(event) => setRecommendations(event.target.value)}
            placeholder="Add care recommendations or treatment plan notes"
            value={recommendations}
          />
          <p className="mt-2 text-xs text-slate-500">
            {recommendations.trim().length}/{MAX_LONG_OUTCOME_FIELD_LENGTH} characters
          </p>
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          <div>
            <label
              className="text-sm font-medium text-slate-700"
              htmlFor="medicationNotes"
            >
              Medication notes optional
            </label>
            <textarea
              className="mt-2 min-h-28 w-full resize-y rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-teal-700 focus:ring-2 focus:ring-teal-100"
              disabled={isSubmitting}
              id="medicationNotes"
              name="medicationNotes"
              onChange={(event) => setMedicationNotes(event.target.value)}
              placeholder="Add medication guidance if relevant"
              value={medicationNotes}
            />
            <p className="mt-2 text-xs text-slate-500">
              {medicationNotes.trim().length}/{MAX_SHORT_OUTCOME_FIELD_LENGTH} characters
            </p>
          </div>

          <div>
            <label
              className="text-sm font-medium text-slate-700"
              htmlFor="followUpInstructions"
            >
              Follow-up instructions optional
            </label>
            <textarea
              className="mt-2 min-h-28 w-full resize-y rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-teal-700 focus:ring-2 focus:ring-teal-100"
              disabled={isSubmitting}
              id="followUpInstructions"
              name="followUpInstructions"
              onChange={(event) => setFollowUpInstructions(event.target.value)}
              placeholder="Add follow-up timing or next steps if needed"
              value={followUpInstructions}
            />
            <p className="mt-2 text-xs text-slate-500">
              {followUpInstructions.trim().length}/{MAX_SHORT_OUTCOME_FIELD_LENGTH} characters
            </p>
          </div>
        </div>

        <div>
          <label
            className="text-sm font-medium text-slate-700"
            htmlFor="additionalNotes"
          >
            Additional notes optional
          </label>
          <textarea
            className="mt-2 min-h-28 w-full resize-y rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-teal-700 focus:ring-2 focus:ring-teal-100"
            disabled={isSubmitting}
            id="additionalNotes"
            name="additionalNotes"
            onChange={(event) => setAdditionalNotes(event.target.value)}
            placeholder="Add any other relevant outcome notes"
            value={additionalNotes}
          />
          <p className="mt-2 text-xs text-slate-500">
            {additionalNotes.trim().length}/{MAX_SHORT_OUTCOME_FIELD_LENGTH} characters
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
