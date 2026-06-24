"use client";

import { useState } from "react";

type DoctorTwoFactorResetActionProps = {
  doctorId: string;
  initialEnabled: boolean;
};

type ResetResponse = {
  error?: string;
  success?: boolean;
};

const confirmationText = "RESET 2FA";

export function DoctorTwoFactorResetAction({
  doctorId,
  initialEnabled,
}: DoctorTwoFactorResetActionProps) {
  const [isEnabled, setIsEnabled] = useState(initialEnabled);
  const [isConfirming, setIsConfirming] = useState(false);
  const [confirmation, setConfirmation] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isPending, setIsPending] = useState(false);

  async function handleReset() {
    if (confirmation !== confirmationText) {
      setError(`Type ${confirmationText} to confirm.`);
      return;
    }

    setError(null);
    setSuccess(false);
    setIsPending(true);

    try {
      const response = await fetch(
        `/api/admin/doctors/${doctorId}/two-factor/reset`,
        {
          method: "POST",
        },
      );
      const result = (await response.json().catch(() => ({}))) as ResetResponse;

      if (!response.ok || !result.success) {
        setError(result.error ?? "Unable to reset doctor two-factor authentication.");
        return;
      }

      setConfirmation("");
      setIsConfirming(false);
      setIsEnabled(false);
      setSuccess(true);
    } catch {
      setError("Unable to reset doctor two-factor authentication right now.");
    } finally {
      setIsPending(false);
    }
  }

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold text-slate-950">
            Doctor two-factor authentication
          </h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Status: {isEnabled ? "Enabled" : "Not enrolled"}
          </p>
        </div>
        <span
          className={`inline-flex w-fit rounded-full border px-3 py-1 text-xs font-medium ${
            isEnabled
              ? "border-teal-200 bg-teal-50 text-teal-700"
              : "border-slate-200 bg-slate-100 text-slate-600"
          }`}
        >
          {isEnabled ? "2FA enabled" : "Setup required"}
        </span>
      </div>

      <div className="mt-4 space-y-2 text-sm leading-6 text-slate-600">
        <p>
          Resetting does not reveal the doctor&apos;s authenticator secret or
          recovery codes.
        </p>
        <p>
          The doctor&apos;s active sessions will be revoked, and the doctor
          must enroll 2FA again after the next password login.
        </p>
      </div>

      {success ? (
        <p className="mt-4 rounded-md border border-teal-200 bg-teal-50 px-3 py-2 text-sm text-teal-800">
          Two-factor enrollment reset. The doctor must enroll again at next
          login.
        </p>
      ) : null}

      {error ? (
        <p
          className="mt-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700"
          role="alert"
        >
          {error}
        </p>
      ) : null}

      {isEnabled && !isConfirming ? (
        <button
          className="mt-5 inline-flex min-h-11 items-center justify-center rounded-md border border-red-300 bg-white px-4 text-sm font-medium text-red-700 transition hover:bg-red-50"
          onClick={() => {
            setError(null);
            setIsConfirming(true);
          }}
          type="button"
        >
          Reset 2FA
        </button>
      ) : null}

      {isEnabled && isConfirming ? (
        <div className="mt-5 max-w-lg rounded-md border border-red-200 bg-red-50 p-4">
          <label
            className="text-sm font-medium text-red-900"
            htmlFor="doctor-two-factor-reset-confirmation"
          >
            Type {confirmationText} to confirm
          </label>
          <input
            className="mt-2 h-11 w-full rounded-md border border-red-300 bg-white px-3 text-base text-slate-950 outline-none focus:border-red-600 focus:ring-2 focus:ring-red-100"
            id="doctor-two-factor-reset-confirmation"
            onChange={(event) => setConfirmation(event.target.value)}
            value={confirmation}
          />
          <div className="mt-4 flex flex-wrap gap-3">
            <button
              className="inline-flex min-h-11 items-center justify-center rounded-md bg-red-700 px-4 text-sm font-semibold text-white hover:bg-red-800 disabled:cursor-not-allowed disabled:bg-slate-300"
              disabled={isPending || confirmation !== confirmationText}
              onClick={handleReset}
              type="button"
            >
              {isPending ? "Resetting..." : "Confirm reset"}
            </button>
            <button
              className="inline-flex min-h-11 items-center justify-center rounded-md border border-slate-300 bg-white px-4 text-sm font-medium text-slate-700 hover:bg-slate-50"
              disabled={isPending}
              onClick={() => {
                setConfirmation("");
                setError(null);
                setIsConfirming(false);
              }}
              type="button"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : null}
    </section>
  );
}
