"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";

type ForgotPasswordResponse = {
  error?: string;
  message?: string;
};

type ForgotPasswordFormProps = {
  email: string;
};

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function buildGenericMessage(email: string) {
  return `If an account exists for ${email}, reset instructions have been sent.`;
}

export function ForgotPasswordForm({ email }: ForgotPasswordFormProps) {
  const [fieldError, setFieldError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);

  const normalizedEmail = email.trim().toLowerCase();
  const canSubmit = Boolean(normalizedEmail && isValidEmail(normalizedEmail));

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setFieldError(null);
    setSubmitError(null);
    setSuccessMessage(null);

    if (!normalizedEmail || !isValidEmail(normalizedEmail)) {
      setFieldError("Enter a valid email address.");
      return;
    }

    setIsPending(true);

    try {
      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: normalizedEmail,
        }),
      });

      const result = (await response.json().catch(() => ({}))) as
        | ForgotPasswordResponse
        | undefined;

      if (!response.ok) {
        setSubmitError(result?.error ?? "Unable to process this request.");
        return;
      }

      setSuccessMessage(buildGenericMessage(normalizedEmail));
    } catch {
      setSubmitError("Unable to process this request right now.");
    } finally {
      setIsPending(false);
    }
  }

  return (
    <form
      className="w-full max-w-md rounded-lg border border-slate-200 bg-white p-6 shadow-sm"
      onSubmit={handleSubmit}
    >
      <div className="space-y-2">
        <p className="text-sm font-medium text-teal-700">Password reset</p>
        <h1 className="text-2xl font-semibold tracking-normal text-slate-950">
          Forgot your password?
        </h1>
        <p className="text-sm leading-6 text-slate-600">
          Reset instructions will be sent only to this account email if the
          account exists and is eligible.
        </p>
      </div>

      <div className="mt-6 rounded-md border border-slate-200 bg-slate-50 px-3 py-3">
        <p className="text-xs font-medium uppercase tracking-normal text-slate-500">
          Account email
        </p>
        <p className="mt-1 break-words text-sm font-medium text-slate-950">
          {normalizedEmail || "No email selected"}
        </p>
      </div>

      {(fieldError || submitError) && (
        <p
          className="mt-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700"
          role="alert"
        >
          {fieldError ?? submitError}
        </p>
      )}

      {successMessage ? (
        <p className="mt-4 rounded-md border border-teal-200 bg-teal-50 px-3 py-2 text-sm text-teal-800">
          {successMessage}
        </p>
      ) : null}

      <button
        className="mt-6 h-11 w-full rounded-md bg-teal-700 px-4 text-sm font-semibold text-white transition hover:bg-teal-800 disabled:cursor-not-allowed disabled:bg-slate-300"
        disabled={isPending || !canSubmit}
        type="submit"
      >
        {isPending ? "Sending..." : "Send reset instructions"}
      </button>

      <p className="mt-4 text-sm leading-6 text-slate-600">
        Need to use a different email?{" "}
        <Link className="font-medium text-teal-700 hover:text-teal-800" href="/login">
          Return to sign in.
        </Link>
      </p>
    </form>
  );
}
