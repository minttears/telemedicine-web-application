"use client";

import { FormEvent, useState } from "react";

import { PasswordField } from "@/components/auth/password-field";

type TwoFactorManagementProps = {
  enabledAt: string;
  initialRemainingRecoveryCodeCount: number;
};

type RegenerateResponse = {
  error?: string;
  recoveryCodes?: string[];
  remainingRecoveryCodeCount?: number;
};

export function TwoFactorManagement({
  enabledAt,
  initialRemainingRecoveryCodeCount,
}: TwoFactorManagementProps) {
  const [password, setPassword] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [remainingRecoveryCodeCount, setRemainingRecoveryCodeCount] =
    useState(initialRemainingRecoveryCodeCount);
  const [recoveryCodes, setRecoveryCodes] = useState<string[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);

  async function handleRegenerate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setRecoveryCodes(null);

    if (!password || !verificationCode.trim()) {
      setError("Enter your current password and two-factor code.");
      return;
    }

    setIsPending(true);

    try {
      const response = await fetch(
        "/api/auth/2fa/recovery-codes/regenerate",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            password,
            verificationCode: verificationCode.trim(),
          }),
        },
      );
      const result = (await response.json().catch(() => ({}))) as RegenerateResponse;

      if (
        !response.ok ||
        !result.recoveryCodes ||
        typeof result.remainingRecoveryCodeCount !== "number"
      ) {
        setError(
          result.error ??
            "Unable to verify your password and two-factor code.",
        );
        return;
      }

      setPassword("");
      setVerificationCode("");
      setRecoveryCodes(result.recoveryCodes);
      setRemainingRecoveryCodeCount(result.remainingRecoveryCodeCount);
    } catch {
      setError("Unable to regenerate recovery codes right now.");
    } finally {
      setIsPending(false);
    }
  }

  return (
    <div className="space-y-6">
      <section className="grid gap-4 md:grid-cols-3">
        <div className="rounded-lg border border-teal-200 bg-teal-50 p-5">
          <p className="text-sm font-medium text-teal-800">Two-factor status</p>
          <p className="mt-2 text-lg font-semibold text-teal-950">Enabled</p>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-medium text-slate-600">
            Recovery codes remaining
          </p>
          <p className="mt-2 text-lg font-semibold text-slate-950">
            {remainingRecoveryCodeCount}
          </p>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-medium text-slate-600">Enabled</p>
          <p className="mt-2 text-sm font-semibold text-slate-950">
            {new Date(enabledAt).toLocaleString()}
          </p>
        </div>
      </section>

      <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-xl font-semibold text-slate-950">
          Two-factor safety
        </h2>
        <div className="mt-3 space-y-2 text-sm leading-6 text-slate-600">
          <p>
            Authenticator codes require your device and the server to have
            synchronized time.
          </p>
          <p>
            Recovery codes are one-time fallback codes. New codes are shown
            only once and should be stored in a secure password manager.
          </p>
          <p>
            Self-disable is not available. Contact an administrator if account
            recovery is required.
          </p>
        </div>
      </section>

      <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-xl font-semibold text-slate-950">
          Regenerate recovery codes
        </h2>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          Confirm your current password and enter either the current
          authenticator code or one unused recovery code. All other unused old
          recovery codes will stop working.
        </p>

        <form className="mt-5 max-w-lg space-y-4" onSubmit={handleRegenerate}>
          <PasswordField
            autoComplete="current-password"
            id="two-factor-current-password"
            label="Current password"
            onChange={setPassword}
            value={password}
          />
          <div className="space-y-2">
            <label
              className="text-sm font-medium text-slate-800"
              htmlFor="two-factor-verification-code"
            >
              Current authenticator or recovery code
            </label>
            <input
              autoComplete="one-time-code"
              className="h-11 w-full rounded-md border border-slate-300 bg-white px-3 text-base text-slate-950 outline-none transition focus:border-teal-600 focus:ring-2 focus:ring-teal-100"
              id="two-factor-verification-code"
              onChange={(event) => setVerificationCode(event.target.value)}
              value={verificationCode}
            />
          </div>

          {error ? (
            <p
              className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700"
              role="alert"
            >
              {error}
            </p>
          ) : null}

          <button
            className="inline-flex min-h-11 items-center justify-center rounded-md bg-teal-700 px-4 text-sm font-semibold text-white transition hover:bg-teal-800 disabled:cursor-not-allowed disabled:bg-slate-300"
            disabled={isPending}
            type="submit"
          >
            {isPending ? "Verifying..." : "Regenerate recovery codes"}
          </button>
        </form>

        {recoveryCodes ? (
          <div className="mt-6 rounded-lg border border-teal-200 bg-teal-50 p-4">
            <h3 className="text-sm font-semibold text-teal-950">
              Save your new recovery codes
            </h3>
            <p className="mt-2 text-sm leading-6 text-teal-900">
              These codes will not be shown again after you leave or refresh
              this page.
            </p>
            <ul className="mt-4 grid gap-2 rounded-md border border-teal-200 bg-white p-4 font-mono text-sm text-slate-950 sm:grid-cols-2">
              {recoveryCodes.map((recoveryCode) => (
                <li key={recoveryCode}>{recoveryCode}</li>
              ))}
            </ul>
          </div>
        ) : null}
      </section>
    </div>
  );
}
