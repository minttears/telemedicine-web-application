"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

type VerifyResponse = {
  error?: string;
  redirectTo?: string;
};

export function TwoFactorChallengeForm() {
  const router = useRouter();
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    if (!code.trim()) {
      setError("Enter an authenticator code or recovery code.");
      return;
    }

    setIsPending(true);

    try {
      const response = await fetch("/api/auth/2fa/challenge/verify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ code: code.trim() }),
      });
      const result = (await response.json().catch(() => ({}))) as VerifyResponse;

      if (!response.ok) {
        setError(result.error ?? "The verification code is invalid.");
        return;
      }

      router.replace(result.redirectTo ?? "/login");
    } catch {
      setError("Unable to verify the code right now.");
    } finally {
      setIsPending(false);
    }
  }

  return (
    <form
      className="w-full max-w-md rounded-lg border border-slate-200 bg-white p-6 shadow-sm"
      onSubmit={handleSubmit}
    >
      <p className="text-sm font-medium text-teal-700">Security verification</p>
      <h1 className="mt-2 text-2xl font-semibold text-slate-950">
        Enter your two-factor code
      </h1>
      <p className="mt-3 text-sm leading-6 text-slate-600">
        Use the 6-digit code from your authenticator app or one unused recovery
        code.
      </p>
      <div className="mt-6 space-y-2">
        <label className="text-sm font-medium text-slate-800" htmlFor="challenge-code">
          Authenticator or recovery code
        </label>
        <input
          autoComplete="one-time-code"
          className="h-11 w-full rounded-md border border-slate-300 px-3 text-base outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-100"
          id="challenge-code"
          onChange={(event) => setCode(event.target.value)}
          value={code}
        />
      </div>
      {error ? (
        <p className="mt-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700" role="alert">
          {error}
        </p>
      ) : null}
      <button
        className="mt-6 h-11 w-full rounded-md bg-teal-700 px-4 text-sm font-semibold text-white hover:bg-teal-800 disabled:bg-slate-300"
        disabled={isPending}
        type="submit"
      >
        {isPending ? "Verifying..." : "Verify and continue"}
      </button>
    </form>
  );
}
