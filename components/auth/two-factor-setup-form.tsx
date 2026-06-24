"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

type SetupStartResponse = {
  error?: string;
  manualKey?: string;
  qrDataUrl?: string;
};

type SetupConfirmResponse = {
  error?: string;
  recoveryCodes?: string[];
  redirectTo?: string;
};

export function TwoFactorSetupForm() {
  const router = useRouter();
  const [manualKey, setManualKey] = useState<string | null>(null);
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const [code, setCode] = useState("");
  const [recoveryCodes, setRecoveryCodes] = useState<string[] | null>(null);
  const [redirectTo, setRedirectTo] = useState("/login");
  const [error, setError] = useState<string | null>(null);
  const [isStarting, setIsStarting] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);

  async function startSetup() {
    setError(null);
    setIsStarting(true);

    try {
      const response = await fetch("/api/auth/2fa/setup/start", {
        method: "POST",
      });
      const result = (await response.json().catch(() => ({}))) as SetupStartResponse;

      if (!response.ok || !result.manualKey || !result.qrDataUrl) {
        setError(result.error ?? "Unable to start two-factor setup.");
        return;
      }

      setManualKey(result.manualKey);
      setQrDataUrl(result.qrDataUrl);
    } catch {
      setError("Unable to start two-factor setup.");
    } finally {
      setIsStarting(false);
    }
  }

  async function confirmSetup(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    if (!/^\d{6}$/.test(code)) {
      setError("Enter the 6-digit code from your authenticator app.");
      return;
    }

    setIsConfirming(true);

    try {
      const response = await fetch("/api/auth/2fa/setup/confirm", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ code }),
      });
      const result = (await response.json().catch(() => ({}))) as SetupConfirmResponse;

      if (!response.ok || !result.recoveryCodes) {
        setError(result.error ?? "Unable to complete two-factor setup.");
        return;
      }

      setManualKey(null);
      setQrDataUrl(null);
      setRecoveryCodes(result.recoveryCodes);
      setRedirectTo(result.redirectTo ?? "/login");
    } catch {
      setError("Unable to complete two-factor setup.");
    } finally {
      setIsConfirming(false);
    }
  }

  if (recoveryCodes) {
    return (
      <section className="w-full max-w-lg rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-sm font-medium text-teal-700">Setup complete</p>
        <h1 className="mt-2 text-2xl font-semibold text-slate-950">
          Save your recovery codes
        </h1>
        <p className="mt-3 text-sm leading-6 text-slate-600">
          Store these codes in a secure password manager. Each code works once,
          and they will not be shown again.
        </p>
        <ul className="mt-5 grid gap-2 rounded-md border border-slate-200 bg-slate-50 p-4 font-mono text-sm text-slate-900 sm:grid-cols-2">
          {recoveryCodes.map((recoveryCode) => (
            <li key={recoveryCode}>{recoveryCode}</li>
          ))}
        </ul>
        <button
          className="mt-6 h-11 w-full rounded-md bg-teal-700 px-4 text-sm font-semibold text-white hover:bg-teal-800"
          onClick={() => router.replace(redirectTo)}
          type="button"
        >
          Continue to workspace
        </button>
      </section>
    );
  }

  return (
    <section className="w-full max-w-lg rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
      <p className="text-sm font-medium text-teal-700">Required security setup</p>
      <h1 className="mt-2 text-2xl font-semibold text-slate-950">
        Set up two-factor authentication
      </h1>
      <p className="mt-3 text-sm leading-6 text-slate-600">
        Use a TOTP authenticator app. This is required before you can access
        your workspace.
      </p>

      {!manualKey || !qrDataUrl ? (
        <button
          className="mt-6 h-11 w-full rounded-md bg-teal-700 px-4 text-sm font-semibold text-white hover:bg-teal-800 disabled:bg-slate-300"
          disabled={isStarting}
          onClick={startSetup}
          type="button"
        >
          {isStarting ? "Preparing setup..." : "Begin setup"}
        </button>
      ) : (
        <form className="mt-6 space-y-5" onSubmit={confirmSetup}>
          <div className="flex justify-center rounded-md border border-slate-200 bg-white p-4">
            {/* The QR data URL is returned once by the authenticated setup API. */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img alt="Authenticator setup QR code" height={240} src={qrDataUrl} width={240} />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-800">Manual setup key</p>
            <p className="mt-2 break-all rounded-md bg-slate-100 px-3 py-2 font-mono text-sm text-slate-900">
              {manualKey}
            </p>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-800" htmlFor="setup-code">
              Verification code
            </label>
            <input
              autoComplete="one-time-code"
              className="h-11 w-full rounded-md border border-slate-300 px-3 text-base outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-100"
              id="setup-code"
              inputMode="numeric"
              maxLength={6}
              onChange={(event) => setCode(event.target.value.replace(/\D/g, ""))}
              value={code}
            />
          </div>
          <button
            className="h-11 w-full rounded-md bg-teal-700 px-4 text-sm font-semibold text-white hover:bg-teal-800 disabled:bg-slate-300"
            disabled={isConfirming}
            type="submit"
          >
            {isConfirming ? "Verifying..." : "Enable two-factor authentication"}
          </button>
        </form>
      )}

      {error ? (
        <p className="mt-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700" role="alert">
          {error}
        </p>
      ) : null}
    </section>
  );
}
