"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

const MAX_DOCTOR_NOTES_LENGTH = 4000;
const MAX_LONG_OUTCOME_FIELD_LENGTH = 4000;
const MAX_SHORT_OUTCOME_FIELD_LENGTH = 2000;

const diagnosisStatusOptions = [
  { label: "Диагноз не установлен", value: "NOT_IDENTIFIED" },
  {
    label: "Требуется дополнительное обследование",
    value: "REQUIRES_FURTHER_EXAMINATION",
  },
  { label: "Предварительный диагноз", value: "PRELIMINARY" },
  { label: "Подтверждённый диагноз", value: "CONFIRMED" },
  { label: "Невозможно определить онлайн", value: "CANNOT_DETERMINE_ONLINE" },
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
      setError("Добавьте заключение по консультации.");
      return;
    }

    if (trimmedDoctorNotes.length > MAX_DOCTOR_NOTES_LENGTH) {
      setError(
        `Заключение должно содержать не более ${MAX_DOCTOR_NOTES_LENGTH} символов.`,
      );
      return;
    }

    if (!diagnosisStatus) {
      setError("Выберите статус диагноза.");
      return;
    }

    const optionalFields = [
      {
        label: "Сведения о диагнозе",
        maxLength: MAX_SHORT_OUTCOME_FIELD_LENGTH,
        value: diagnosisDetails.trim(),
      },
      {
        label: "Рекомендации",
        maxLength: MAX_LONG_OUTCOME_FIELD_LENGTH,
        value: recommendations.trim(),
      },
      {
        label: "Рекомендации по лекарствам",
        maxLength: MAX_SHORT_OUTCOME_FIELD_LENGTH,
        value: medicationNotes.trim(),
      },
      {
        label: "Последующее наблюдение",
        maxLength: MAX_SHORT_OUTCOME_FIELD_LENGTH,
        value: followUpInstructions.trim(),
      },
      {
        label: "Дополнительные заметки",
        maxLength: MAX_SHORT_OUTCOME_FIELD_LENGTH,
        value: additionalNotes.trim(),
      },
    ];

    for (const field of optionalFields) {
      if (field.value.length > field.maxLength) {
        setError(
          `${field.label}: не более ${field.maxLength} символов.`,
        );
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
        setError(payload?.error ?? "Не удалось завершить консультацию.");
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
          ? "Не удалось завершить консультацию."
          : error instanceof Error
            ? error.message
            : "Не удалось завершить консультацию.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
      <div>
        <p className="text-sm font-medium text-teal-700">
          Завершение консультации
        </p>
        <h2 className="mt-2 text-lg font-semibold text-slate-950">
          Добавьте итог консультации
        </h2>
        <p className="mt-3 text-sm leading-6 text-slate-600">
          Добавьте заключение, рекомендации и дальнейшие действия. Сведения о
          лекарствах носят информационный характер и не являются официальным
          рецептом.
        </p>
      </div>

      <form className="mt-5 space-y-5" onSubmit={handleSubmit}>
        <div>
          <label
            className="text-sm font-medium text-slate-700"
            htmlFor="doctorNotes"
          >
            Заключение
          </label>
          <textarea
            className="mt-2 min-h-40 w-full resize-y rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-teal-700 focus:ring-2 focus:ring-teal-100"
            disabled={isSubmitting}
            id="doctorNotes"
            name="doctorNotes"
            onChange={(event) => setDoctorNotes(event.target.value)}
            placeholder="Добавьте заключение или краткий итог консультации"
            value={doctorNotes}
          />
          <p className="mt-2 text-xs text-slate-500">
            {doctorNotes.trim().length}/{MAX_DOCTOR_NOTES_LENGTH} символов
          </p>
        </div>

        <div>
          <label
            className="text-sm font-medium text-slate-700"
            htmlFor="diagnosisStatus"
          >
            Статус диагноза
          </label>
          <select
            className="mt-2 min-h-11 w-full rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-950 outline-none transition focus:border-teal-700 focus:ring-2 focus:ring-teal-100"
            disabled={isSubmitting}
            id="diagnosisStatus"
            name="diagnosisStatus"
            onChange={(event) => setDiagnosisStatus(event.target.value)}
            value={diagnosisStatus}
          >
            <option value="">Выберите статус диагноза</option>
            {diagnosisStatusOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <p className="mt-2 text-xs text-slate-500">
            Если точный диагноз определить невозможно, выберите «Диагноз не
            установлен» или «Требуется дополнительное обследование».
          </p>
        </div>

        <div>
          <label
            className="text-sm font-medium text-slate-700"
            htmlFor="diagnosisDetails"
          >
            Сведения о диагнозе (необязательно)
          </label>
          <textarea
            className="mt-2 min-h-28 w-full resize-y rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-teal-700 focus:ring-2 focus:ring-teal-100"
            disabled={isSubmitting}
            id="diagnosisDetails"
            name="diagnosisDetails"
            onChange={(event) => setDiagnosisDetails(event.target.value)}
            placeholder="Добавьте сведения, если это клинически обосновано"
            value={diagnosisDetails}
          />
          <p className="mt-2 text-xs text-slate-500">
            {diagnosisDetails.trim().length}/{MAX_SHORT_OUTCOME_FIELD_LENGTH}{" "}
            символов
          </p>
        </div>

        <div>
          <label
            className="text-sm font-medium text-slate-700"
            htmlFor="recommendations"
          >
            Рекомендации (необязательно)
          </label>
          <textarea
            className="mt-2 min-h-32 w-full resize-y rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-teal-700 focus:ring-2 focus:ring-teal-100"
            disabled={isSubmitting}
            id="recommendations"
            name="recommendations"
            onChange={(event) => setRecommendations(event.target.value)}
            placeholder="Добавьте рекомендации и дальнейшие действия"
            value={recommendations}
          />
          <p className="mt-2 text-xs text-slate-500">
            {recommendations.trim().length}/{MAX_LONG_OUTCOME_FIELD_LENGTH}{" "}
            символов
          </p>
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          <div>
            <label
              className="text-sm font-medium text-slate-700"
              htmlFor="medicationNotes"
            >
              Рекомендации по лекарствам (необязательно)
            </label>
            <textarea
              className="mt-2 min-h-28 w-full resize-y rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-teal-700 focus:ring-2 focus:ring-teal-100"
              disabled={isSubmitting}
              id="medicationNotes"
              name="medicationNotes"
              onChange={(event) => setMedicationNotes(event.target.value)}
              placeholder="Добавьте рекомендации по лекарствам при необходимости"
              value={medicationNotes}
            />
            <p className="mt-2 text-xs text-slate-500">
              {medicationNotes.trim().length}/{MAX_SHORT_OUTCOME_FIELD_LENGTH}{" "}
              символов
            </p>
          </div>

          <div>
            <label
              className="text-sm font-medium text-slate-700"
              htmlFor="followUpInstructions"
            >
              Последующее наблюдение (необязательно)
            </label>
            <textarea
              className="mt-2 min-h-28 w-full resize-y rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-teal-700 focus:ring-2 focus:ring-teal-100"
              disabled={isSubmitting}
              id="followUpInstructions"
              name="followUpInstructions"
              onChange={(event) => setFollowUpInstructions(event.target.value)}
              placeholder="Укажите сроки повторного обращения или дальнейшие действия"
              value={followUpInstructions}
            />
            <p className="mt-2 text-xs text-slate-500">
              {followUpInstructions.trim().length}/
              {MAX_SHORT_OUTCOME_FIELD_LENGTH} символов
            </p>
          </div>
        </div>

        <div>
          <label
            className="text-sm font-medium text-slate-700"
            htmlFor="additionalNotes"
          >
            Дополнительные заметки (необязательно)
          </label>
          <textarea
            className="mt-2 min-h-28 w-full resize-y rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-teal-700 focus:ring-2 focus:ring-teal-100"
            disabled={isSubmitting}
            id="additionalNotes"
            name="additionalNotes"
            onChange={(event) => setAdditionalNotes(event.target.value)}
            placeholder="Добавьте другие важные заметки по итогам консультации"
            value={additionalNotes}
          />
          <p className="mt-2 text-xs text-slate-500">
            {additionalNotes.trim().length}/{MAX_SHORT_OUTCOME_FIELD_LENGTH}{" "}
            символов
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
          {isSubmitting ? "Завершение..." : "Завершить консультацию"}
        </button>
      </form>
    </section>
  );
}
