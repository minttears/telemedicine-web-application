"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { PasswordField } from "@/components/auth/password-field";

const genericLoginError = "Invalid email or password.";

type LoginResponse = {
  redirectTo?: string;
};

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fieldError, setFieldError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const normalizedEmail = email.trim().toLowerCase();

    setFieldError(null);
    setSubmitError(null);

    if (!normalizedEmail || !password) {
      setFieldError("Email and password are required.");
      return;
    }

    if (!isValidEmail(normalizedEmail)) {
      setFieldError("Enter a valid email address.");
      return;
    }

    setIsPending(true);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: normalizedEmail,
          password,
        }),
      });

      if (!response.ok) {
        setSubmitError(genericLoginError);
        return;
      }

      const result = (await response.json()) as LoginResponse;
      router.replace(result.redirectTo ?? "/patient/dashboard");
    } catch {
      setSubmitError("Unable to sign in right now. Try again.");
    } finally {
      setIsPending(false);
    }
  }

  function handleForgotPassword() {
    const normalizedEmail = email.trim().toLowerCase();

    setFieldError(null);
    setSubmitError(null);

    if (!normalizedEmail) {
      setFieldError("Please enter your email first.");
      return;
    }

    if (!isValidEmail(normalizedEmail)) {
      setFieldError("Enter a valid email address.");
      return;
    }

    router.push(`/forgot-password?email=${encodeURIComponent(normalizedEmail)}`);
  }

  return (
    <form
      className="w-full max-w-md rounded-lg border border-slate-200 bg-white p-6 shadow-sm"
      onSubmit={handleSubmit}
    >
      <div className="space-y-2">
        <p className="text-sm font-medium text-teal-700">Secure access</p>
        <h1 className="text-2xl font-semibold tracking-normal text-slate-950">
          Sign in to Telemedicine
        </h1>
        <p className="text-sm leading-6 text-slate-600">
          Access your secure workspace for consultations, messages, files, and
          care history.
        </p>
      </div>

      <div className="mt-6 space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-800" htmlFor="email">
            Email
          </label>
          <input
            autoComplete="email"
            className="h-11 w-full rounded-md border border-slate-300 bg-white px-3 text-base text-slate-950 outline-none transition focus:border-teal-600 focus:ring-2 focus:ring-teal-100"
            id="email"
            inputMode="email"
            name="email"
            onChange={(event) => setEmail(event.target.value)}
            placeholder="name@example.com"
            type="email"
            value={email}
          />
        </div>

        <div className="space-y-2">
          <PasswordField
            autoComplete="current-password"
            id="password"
            label="Password"
            name="password"
            onChange={setPassword}
            value={password}
          />
          <button
            className="text-sm font-medium text-teal-700 transition hover:text-teal-800"
            onClick={handleForgotPassword}
            type="button"
          >
            Forgot password?
          </button>
        </div>
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
        {isPending ? "Signing in..." : "Sign in"}
      </button>

      <p className="mt-4 text-sm leading-6 text-slate-600">
        Don&apos;t have an account?{" "}
        <Link
          className="font-medium text-teal-700 hover:text-teal-800"
          href="/register"
        >
          Create a patient account.
        </Link>
      </p>
    </form>
  );
}
