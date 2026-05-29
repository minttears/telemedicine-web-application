"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

type ResetPasswordFormProps = {
  token: string;
};

type ResetPasswordResponse = {
  error?: string;
  redirectTo?: string;
};

export function ResetPasswordForm({ token }: ResetPasswordFormProps) {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [fieldError, setFieldError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setFieldError(null);
    setSubmitError(null);

    if (password.length < 8) {
      setFieldError("Password must be at least 8 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setFieldError("Passwords must match.");
      return;
    }

    setIsPending(true);

    try {
      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          confirmPassword,
          password,
          token,
        }),
      });
      const result = (await response.json().catch(() => ({}))) as ResetPasswordResponse;

      if (!response.ok) {
        setSubmitError(
          result.error ?? "This password reset link is invalid or expired.",
        );
        return;
      }

      router.replace(result.redirectTo ?? "/login?passwordReset=1");
    } catch {
      setSubmitError("Unable to reset password right now.");
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
        <p className="text-sm font-medium text-teal-700">Doctor password reset</p>
        <h1 className="text-2xl font-semibold tracking-normal text-slate-950">
          Reset your password
        </h1>
        <p className="text-sm leading-6 text-slate-600">
          Create a new password for your doctor workspace. You will sign in
          after the reset is complete.
        </p>
      </div>

      <div className="mt-6 space-y-4">
        <label className="block">
          <span className="text-sm font-medium text-slate-800">Password</span>
          <input
            autoComplete="new-password"
            className="mt-2 h-11 w-full rounded-md border border-slate-300 bg-white px-3 text-base text-slate-950 outline-none transition focus:border-teal-600 focus:ring-2 focus:ring-teal-100"
            onChange={(event) => setPassword(event.target.value)}
            type="password"
            value={password}
          />
          <span className="mt-2 block text-xs leading-5 text-slate-500">
            Use at least 8 characters.
          </span>
        </label>

        <label className="block">
          <span className="text-sm font-medium text-slate-800">
            Confirm password
          </span>
          <input
            autoComplete="new-password"
            className="mt-2 h-11 w-full rounded-md border border-slate-300 bg-white px-3 text-base text-slate-950 outline-none transition focus:border-teal-600 focus:ring-2 focus:ring-teal-100"
            onChange={(event) => setConfirmPassword(event.target.value)}
            type="password"
            value={confirmPassword}
          />
        </label>
      </div>

      {(fieldError || submitError) && (
        <p
          className="mt-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700"
          role="alert"
        >
          {fieldError ?? submitError}
        </p>
      )}

      <button
        className="mt-6 h-11 w-full rounded-md bg-teal-700 px-4 text-sm font-semibold text-white transition hover:bg-teal-800 disabled:cursor-not-allowed disabled:bg-slate-300"
        disabled={isPending}
        type="submit"
      >
        {isPending ? "Saving..." : "Reset password"}
      </button>

      <p className="mt-4 text-sm leading-6 text-slate-600">
        Already reset your password?{" "}
        <Link className="font-medium text-teal-700 hover:text-teal-800" href="/login">
          Sign in
        </Link>
      </p>
    </form>
  );
}
