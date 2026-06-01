"use client";

import { useState, useTransition } from "react";

type VideoCallPanelProps = {
  consultationId: string;
  disabledReason?: string;
  isEligible: boolean;
  role: "DOCTOR" | "PATIENT";
};

type CallSessionResponse = {
  provider?: string;
  sessionStatus?: string;
};

export function VideoCallPanel({
  consultationId,
  disabledReason,
  isEligible,
  role,
}: VideoCallPanelProps) {
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const buttonLabel = role === "DOCTOR" ? "Start video call" : "Join video call";

  function requestCallSession() {
    setError(null);
    setMessage(null);

    startTransition(async () => {
      try {
        const response = await fetch(
          `/api/consultations/${consultationId}/call/session`,
          {
            method: "POST",
          },
        );
        const payload = (await response.json().catch(() => null)) as
          | (CallSessionResponse & { error?: string })
          | null;

        if (!response.ok) {
          setError(payload?.error ?? "Unable to prepare the video call.");
          return;
        }

        setMessage(
          `Video session is ready through ${payload?.provider ?? "Daily"}. Full call room UI is deferred to Phase 14C. Status: ${payload?.sessionStatus ?? "READY"}.`,
        );
      } catch {
        setError("Unable to prepare the video call.");
      }
    });
  }

  return (
    <section className="rounded-lg border border-teal-100 bg-teal-50 p-6 shadow-sm">
      <p className="text-sm font-medium text-teal-800">Video consultation</p>
      <h2 className="mt-2 text-lg font-semibold text-slate-950">
        Daily video call
      </h2>
      <p className="mt-3 text-sm leading-6 text-slate-700">
        Private Daily rooms and short-lived server-issued meeting tokens are used
        for eligible scheduled consultations. Tokens are never shown on this
        page.
      </p>
      <button
        className="mt-5 inline-flex min-h-10 w-fit items-center justify-center rounded-md bg-teal-700 px-4 text-sm font-medium text-white transition hover:bg-teal-800 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:text-slate-600"
        disabled={!isEligible || isPending}
        onClick={requestCallSession}
        type="button"
      >
        {isPending ? "Preparing call..." : buttonLabel}
      </button>
      {!isEligible && disabledReason ? (
        <p className="mt-3 text-sm leading-6 text-slate-600">{disabledReason}</p>
      ) : null}
      {message ? (
        <p className="mt-3 text-sm leading-6 text-teal-800">{message}</p>
      ) : null}
      {error ? (
        <p className="mt-3 text-sm leading-6 text-red-700">{error}</p>
      ) : null}
    </section>
  );
}
