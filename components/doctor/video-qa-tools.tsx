"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type StartMode = "now" | "soon";

export function VideoQaTools() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pendingMode, setPendingMode] = useState<StartMode | null>(null);

  async function createQaConsultation(mode: StartMode) {
    if (pendingMode) {
      return;
    }

    setError(null);
    setPendingMode(mode);

    try {
      const response = await fetch("/api/dev/video-qa-consultation", {
        body: JSON.stringify({
          startOffsetMinutes: mode === "now" ? "now" : 5,
        }),
        headers: {
          "Content-Type": "application/json",
        },
        method: "POST",
      });
      const payload = (await response.json().catch(() => null)) as {
        error?: string;
        redirectTo?: string;
      } | null;

      if (!response.ok) {
        setError(
          payload?.error ??
            "Не удалось создать тестовую консультацию для проверки видеозвонка.",
        );
        setPendingMode(null);
        return;
      }

      if (payload?.redirectTo) {
        router.push(payload.redirectTo);
        router.refresh();
        return;
      }

      setError(
        "Тестовая консультация создана, но её страницу не удалось открыть.",
      );
      setPendingMode(null);
    } catch {
      setError(
        "Не удалось создать тестовую консультацию для проверки видеозвонка.",
      );
      setPendingMode(null);
    }
  }

  return (
    <section className="rounded-lg border border-amber-200 bg-amber-50 p-6 shadow-sm">
      <p className="text-sm font-medium text-amber-800">
        Только для разработки
      </p>
      <h2 className="mt-2 text-xl font-semibold text-slate-950">
        Создать тестовую консультацию для проверки видеозвонка
      </h2>
      <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-700">
        Создаёт локальное забронированное время и запланированную консультацию с
        существующим активным пациентом. Используйте этот инструмент вместо
        изменения системного времени: токены видеосвязи зависят от реальных
        часов устройства.
      </p>
      <div className="mt-5 flex flex-col gap-3 sm:flex-row">
        <button
          className="inline-flex min-h-10 items-center justify-center rounded-md bg-amber-700 px-4 text-sm font-medium text-white transition hover:bg-amber-800 disabled:cursor-not-allowed disabled:bg-slate-300"
          disabled={pendingMode !== null}
          onClick={() => void createQaConsultation("soon")}
          type="button"
        >
          {pendingMode === "soon"
            ? "Создание..."
            : "Начать через 5 минут"}
        </button>
        <button
          className="inline-flex min-h-10 items-center justify-center rounded-md border border-amber-300 bg-white px-4 text-sm font-medium text-amber-900 transition hover:border-amber-700 disabled:cursor-not-allowed disabled:border-slate-200 disabled:text-slate-500"
          disabled={pendingMode !== null}
          onClick={() => void createQaConsultation("now")}
          type="button"
        >
          {pendingMode === "now" ? "Создание..." : "Начать сейчас"}
        </button>
      </div>
      {error ? <p className="mt-3 text-sm leading-6 text-red-700">{error}</p> : null}
    </section>
  );
}
