"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { PasswordField } from "@/components/auth/password-field";

type SetPasswordFormProps = {
  token: string;
};

type SetPasswordResponse = {
  error?: string;
  redirectTo?: string;
};

export function SetPasswordForm({ token }: SetPasswordFormProps) {
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
      const response = await fetch("/api/auth/set-password", {
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
      const result = (await response.json().catch(() => ({}))) as SetPasswordResponse;

      if (!response.ok) {
        setSubmitError(
          result.error ?? "This invite link is invalid or expired.",
        );
        return;
      }

      router.replace(result.redirectTo ?? "/login?passwordSet=1");
    } catch {
      setSubmitError("Unable to set password right now.");
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
        <p className="text-sm font-medium text-teal-700">Doctor invite</p>
        <h1 className="text-2xl font-semibold tracking-normal text-slate-950">
          Set your password
        </h1>
        <p className="text-sm leading-6 text-slate-600">
          Create a password for your doctor workspace. You will sign in after
          setup is complete.
        </p>
      </div>

      <div className="mt-6 space-y-4">
        <PasswordField
          autoComplete="new-password"
          helpText="Use at least 8 characters."
          id="password"
          label="Password"
          onChange={setPassword}
          value={password}
        />

        <PasswordField
          autoComplete="new-password"
          id="confirmPassword"
          label="Confirm password"
          onChange={setConfirmPassword}
          value={confirmPassword}
        />
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
        {isPending ? "Saving..." : "Set password"}
      </button>

      <p className="mt-4 text-sm leading-6 text-slate-600">
        Already set your password?{" "}
        <Link className="font-medium text-teal-700 hover:text-teal-800" href="/login">
          Sign in
        </Link>
      </p>
    </form>
  );
}
