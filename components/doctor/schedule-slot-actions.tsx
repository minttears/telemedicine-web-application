"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type ScheduleSlotActionsProps = {
  slotId: string;
};

export function ScheduleSlotActions({ slotId }: ScheduleSlotActionsProps) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isCancelling, setIsCancelling] = useState(false);

  async function handleCancel() {
    setError(null);
    setIsCancelling(true);

    try {
      const response = await fetch("/api/doctor/schedule-slots", {
        body: JSON.stringify({
          action: "cancel",
          slotId,
        }),
        headers: {
          "Content-Type": "application/json",
        },
        method: "PATCH",
      });

      const payload = (await response.json().catch(() => null)) as {
        error?: string;
      } | null;

      if (!response.ok) {
        setError(payload?.error ?? "Не удалось отменить интервал расписания.");
        return;
      }

      router.refresh();
    } catch {
      setError("Не удалось отменить интервал расписания. Повторите попытку.");
    } finally {
      setIsCancelling(false);
    }
  }

  return (
    <div className="space-y-2">
      <button
        className="inline-flex min-h-10 items-center justify-center rounded-md border border-slate-300 bg-white px-3 text-sm font-medium text-slate-700 transition hover:border-red-300 hover:text-red-700 disabled:cursor-not-allowed disabled:border-slate-200 disabled:text-slate-400"
        disabled={isCancelling}
        onClick={handleCancel}
        type="button"
      >
        {isCancelling ? "Отмена..." : "Отменить интервал"}
      </button>
      {error ? (
        <p className="text-sm leading-6 text-red-700">{error}</p>
      ) : null}
    </div>
  );
}
