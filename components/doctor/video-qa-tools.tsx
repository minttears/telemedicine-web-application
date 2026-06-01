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
        setError(payload?.error ?? "Unable to create a video QA consultation.");
        setPendingMode(null);
        return;
      }

      if (payload?.redirectTo) {
        router.push(payload.redirectTo);
        router.refresh();
        return;
      }

      setError("QA consultation was created, but the next page could not be opened.");
      setPendingMode(null);
    } catch {
      setError("Unable to create a video QA consultation.");
      setPendingMode(null);
    }
  }

  return (
    <section className="rounded-lg border border-amber-200 bg-amber-50 p-6 shadow-sm">
      <p className="text-sm font-medium text-amber-800">Development QA only</p>
      <h2 className="mt-2 text-xl font-semibold text-slate-950">
        Create a video test consultation
      </h2>
      <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-700">
        Creates a local development-only booked slot and scheduled consultation
        with an existing active patient. Use this instead of changing system time
        because video provider tokens depend on the real clock.
      </p>
      <div className="mt-5 flex flex-col gap-3 sm:flex-row">
        <button
          className="inline-flex min-h-10 items-center justify-center rounded-md bg-amber-700 px-4 text-sm font-medium text-white transition hover:bg-amber-800 disabled:cursor-not-allowed disabled:bg-slate-300"
          disabled={pendingMode !== null}
          onClick={() => void createQaConsultation("soon")}
          type="button"
        >
          {pendingMode === "soon" ? "Creating..." : "Start in 5 minutes"}
        </button>
        <button
          className="inline-flex min-h-10 items-center justify-center rounded-md border border-amber-300 bg-white px-4 text-sm font-medium text-amber-900 transition hover:border-amber-700 disabled:cursor-not-allowed disabled:border-slate-200 disabled:text-slate-500"
          disabled={pendingMode !== null}
          onClick={() => void createQaConsultation("now")}
          type="button"
        >
          {pendingMode === "now" ? "Creating..." : "Start now"}
        </button>
      </div>
      {error ? <p className="mt-3 text-sm leading-6 text-red-700">{error}</p> : null}
    </section>
  );
}
