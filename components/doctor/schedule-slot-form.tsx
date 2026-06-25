"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

import { getMinimumBookingStartsAt } from "@/lib/booking-lead-time";

const MIN_SLOT_DURATION_MS = 15 * 60 * 1000;
const MAX_SLOT_DURATION_MS = 4 * 60 * 60 * 1000;

function toIsoFromLocalDateTime(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return date.toISOString();
}

export function ScheduleSlotForm() {
  const router = useRouter();
  const [startsAt, setStartsAt] = useState("");
  const [endsAt, setEndsAt] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const startsAtIso = toIsoFromLocalDateTime(startsAt);
    const endsAtIso = toIsoFromLocalDateTime(endsAt);

    if (!startsAtIso || !endsAtIso) {
      setError("Укажите время начала и окончания.");
      return;
    }

    const startDate = new Date(startsAtIso);
    const endDate = new Date(endsAtIso);
    const durationMs = endDate.getTime() - startDate.getTime();

    const minimumStartsAt = getMinimumBookingStartsAt();

    if (startDate < minimumStartsAt) {
      setError("Время приёма должно начинаться не ранее чем через 5 минут.");
      return;
    }

    if (endDate <= startDate) {
      setError("Время окончания должно быть позже времени начала.");
      return;
    }

    if (durationMs < MIN_SLOT_DURATION_MS) {
      setError("Продолжительность должна быть не менее 15 минут.");
      return;
    }

    if (durationMs > MAX_SLOT_DURATION_MS) {
      setError("Продолжительность не может превышать 4 часа.");
      return;
    }

    setError(null);
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/doctor/schedule-slots", {
        body: JSON.stringify({
          endsAt: endsAtIso,
          startsAt: startsAtIso,
        }),
        headers: {
          "Content-Type": "application/json",
        },
        method: "POST",
      });

      const payload = (await response.json().catch(() => null)) as {
        error?: string;
      } | null;

      if (!response.ok) {
        setError(payload?.error ?? "Не удалось добавить доступное время.");
        return;
      }

      setStartsAt("");
      setEndsAt("");
      router.refresh();
    } catch {
      setError("Не удалось добавить доступное время. Повторите попытку.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label
            className="text-sm font-medium text-slate-700"
            htmlFor="startsAt"
          >
            Время начала
          </label>
          <input
            className="mt-2 min-h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-900 outline-none transition focus:border-teal-700 focus:ring-2 focus:ring-teal-100"
            disabled={isSubmitting}
            id="startsAt"
            name="startsAt"
            onChange={(event) => setStartsAt(event.target.value)}
            type="datetime-local"
            value={startsAt}
          />
        </div>
        <div>
          <label
            className="text-sm font-medium text-slate-700"
            htmlFor="endsAt"
          >
            Время окончания
          </label>
          <input
            className="mt-2 min-h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-900 outline-none transition focus:border-teal-700 focus:ring-2 focus:ring-teal-100"
            disabled={isSubmitting}
            id="endsAt"
            name="endsAt"
            onChange={(event) => setEndsAt(event.target.value)}
            type="datetime-local"
            value={endsAt}
          />
        </div>
      </div>

      <p className="text-sm leading-6 text-slate-600">
        Добавляйте доступное время не ранее чем через 5 минут.
        Продолжительность — от 15 минут до 4 часов.
      </p>

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
        {isSubmitting ? "Добавление..." : "Добавить доступное время"}
      </button>
    </form>
  );
}
