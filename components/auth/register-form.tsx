"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { PasswordField } from "@/components/auth/password-field";

type RegisterResponse = {
  redirectTo?: string;
  error?: string;
};

const duplicateEmailMessage = "An account with this email cannot be registered.";

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export function RegisterForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [gender, setGender] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [fieldError, setFieldError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const normalizedEmail = email.trim().toLowerCase();

    setFieldError(null);
    setSubmitError(null);

    if (!normalizedEmail || !password || !confirmPassword) {
      setFieldError("Email, password, and confirmation are required.");
      return;
    }

    if (!isValidEmail(normalizedEmail)) {
      setFieldError("Enter a valid email address.");
      return;
    }

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
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: name.trim(),
          email: normalizedEmail,
          dateOfBirth,
          gender,
          password,
          confirmPassword,
        }),
      });

      const result = (await response.json().catch(() => ({}))) as RegisterResponse;

      if (!response.ok) {
        setSubmitError(
          response.status === 409
            ? duplicateEmailMessage
            : result.error ?? "Unable to register with these details.",
        );
        return;
      }

      router.replace(result.redirectTo ?? "/patient/dashboard");
    } catch {
      setSubmitError("Unable to register right now. Try again.");
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
        <p className="text-sm font-medium text-teal-700">Patient registration</p>
        <h1 className="text-2xl font-semibold tracking-normal text-slate-950">
          Create your patient account
        </h1>
        <p className="text-sm leading-6 text-slate-600">
          Registration is currently available for patients only.
        </p>
      </div>

      <div className="mt-6 space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-800" htmlFor="name">
            Full name
          </label>
          <input
            autoComplete="name"
            className="h-11 w-full rounded-md border border-slate-300 bg-white px-3 text-base text-slate-950 outline-none transition focus:border-teal-600 focus:ring-2 focus:ring-teal-100"
            id="name"
            maxLength={100}
            name="name"
            onChange={(event) => setName(event.target.value)}
            placeholder="Your name"
            type="text"
            value={name}
          />
        </div>

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

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <label
              className="text-sm font-medium text-slate-800"
              htmlFor="dateOfBirth"
            >
              Date of birth
            </label>
            <input
              className="h-11 w-full rounded-md border border-slate-300 bg-white px-3 text-base text-slate-950 outline-none transition focus:border-teal-600 focus:ring-2 focus:ring-teal-100"
              id="dateOfBirth"
              name="dateOfBirth"
              onChange={(event) => setDateOfBirth(event.target.value)}
              type="date"
              value={dateOfBirth}
            />
          </div>

          <div className="space-y-2">
            <label
              className="text-sm font-medium text-slate-800"
              htmlFor="gender"
            >
              Gender
            </label>
            <select
              className="h-11 w-full rounded-md border border-slate-300 bg-white px-3 text-base text-slate-950 outline-none transition focus:border-teal-600 focus:ring-2 focus:ring-teal-100"
              id="gender"
              name="gender"
              onChange={(event) => setGender(event.target.value)}
              value={gender}
            >
              <option value="">Prefer not to say</option>
              <option value="Female">Female</option>
              <option value="Male">Male</option>
              <option value="Other">Other</option>
            </select>
          </div>
        </div>

        <PasswordField
          autoComplete="new-password"
          helpText="Use at least 8 characters."
          id="password"
          label="Password"
          name="password"
          onChange={setPassword}
          value={password}
        />

        <PasswordField
          autoComplete="new-password"
          id="confirmPassword"
          label="Confirm password"
          name="confirmPassword"
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
        {isPending ? "Creating account..." : "Create patient account"}
      </button>

      <p className="mt-4 text-sm leading-6 text-slate-600">
        Already have an account?{" "}
        <Link className="font-medium text-teal-700 hover:text-teal-800" href="/login">
          Sign in
        </Link>
      </p>
    </form>
  );
}
