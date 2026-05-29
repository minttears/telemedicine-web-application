"use client";

import { useState } from "react";

type DoctorPasswordResetActionProps = {
  doctorId: string;
};

type PasswordResetResponse = {
  error?: string;
  resetExpiresAt?: string;
  resetUrl?: string;
};

export function DoctorPasswordResetAction({
  doctorId,
}: DoctorPasswordResetActionProps) {
  const [reset, setReset] = useState<{
    expiresAt: string;
    url: string;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);

  async function handleGenerateReset() {
    setError(null);
    setReset(null);
    setIsPending(true);

    try {
      const response = await fetch(
        `/api/admin/doctors/${doctorId}/password-reset`,
        {
          method: "POST",
        },
      );
      const result = (await response.json().catch(() => ({}))) as PasswordResetResponse;

      if (!response.ok || !result.resetUrl || !result.resetExpiresAt) {
        setError(result.error ?? "Unable to create password reset link.");
        return;
      }

      setReset({
        expiresAt: result.resetExpiresAt,
        url: result.resetUrl,
      });
    } catch {
      setError("Unable to create password reset link right now.");
    } finally {
      setIsPending(false);
    }
  }

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="text-xl font-semibold text-slate-950">
        Doctor password reset
      </h2>
      <p className="mt-2 text-sm leading-6 text-slate-600">
        Generate a one-time reset link for an existing doctor who forgot their
        password or needs a reset. Any unused active reset link for this doctor
        will be invalidated.
      </p>

      {reset ? (
        <div className="mt-5 rounded-lg border border-teal-200 bg-teal-50 p-4">
          <h3 className="text-sm font-semibold text-teal-950">
            One-time password reset link
          </h3>
          <p className="mt-2 text-sm leading-6 text-teal-900">
            Copy this link now and share it through an approved secure process.
            It expires in 1 hour and will not be shown again after you leave
            this page.
          </p>
          <label className="mt-3 block">
            <span className="text-xs font-medium uppercase tracking-normal text-teal-900">
              Password reset link
            </span>
            <input
              className="mt-2 w-full rounded-md border border-teal-200 bg-white px-3 py-2 text-sm text-slate-950"
              readOnly
              value={reset.url}
            />
          </label>
          <p className="mt-2 text-xs text-teal-900">
            Expires {new Date(reset.expiresAt).toLocaleString()}.
          </p>
        </div>
      ) : null}

      {error ? (
        <p className="mt-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      ) : null}

      <button
        className="mt-5 inline-flex min-h-11 items-center justify-center rounded-md border border-teal-700 bg-white px-4 text-sm font-medium text-teal-800 transition hover:bg-teal-50 disabled:cursor-not-allowed disabled:border-slate-300 disabled:text-slate-400"
        disabled={isPending}
        onClick={handleGenerateReset}
        type="button"
      >
        {isPending ? "Generating..." : "Generate password reset link"}
      </button>
    </section>
  );
}
