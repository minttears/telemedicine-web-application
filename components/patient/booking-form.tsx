"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";

type BookingFormProps = {
  doctorId: string;
  scheduleSlotId: string;
};

export function BookingForm({ doctorId, scheduleSlotId }: BookingFormProps) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (isSubmitting) {
      return;
    }

    setError(null);
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/consultations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          doctorId,
          scheduleSlotId,
        }),
      });

      const result = (await response.json().catch(() => null)) as {
        error?: string;
        redirectTo?: string;
      } | null;

      if (!response.ok) {
        setError(
          result?.error ??
            "Не удалось записаться на это время. Выберите другое доступное время.",
        );
        setIsSubmitting(false);
        return;
      }

      if (result?.redirectTo) {
        router.push(result.redirectTo);
        router.refresh();
        return;
      }

      setError(
        "Запись создана, но страницу консультации не удалось открыть.",
      );
      setIsSubmitting(false);
    } catch {
      setError("Не удалось записаться на это время. Повторите попытку.");
      setIsSubmitting(false);
    }
  }

  return (
    <form className="mt-4" onSubmit={handleSubmit}>
      <button
        className="inline-flex min-h-10 w-full items-center justify-center rounded-md bg-teal-700 px-4 text-sm font-medium text-white transition hover:bg-teal-800 disabled:cursor-not-allowed disabled:bg-slate-300"
        disabled={isSubmitting}
        type="submit"
      >
        {isSubmitting ? "Запись..." : "Записаться на это время"}
      </button>
      {error ? (
        <p className="mt-3 text-sm leading-6 text-red-700">{error}</p>
      ) : null}
    </form>
  );
}
