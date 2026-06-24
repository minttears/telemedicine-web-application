"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { PasswordField } from "@/components/auth/password-field";

const genericLoginError = "Неверный email или пароль.";

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
      setFieldError("Введите email и пароль.");
      return;
    }

    if (!isValidEmail(normalizedEmail)) {
      setFieldError("Введите корректный email.");
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
      setSubmitError("Сейчас не удалось войти. Повторите попытку.");
    } finally {
      setIsPending(false);
    }
  }

  function handleForgotPassword() {
    const normalizedEmail = email.trim().toLowerCase();

    setFieldError(null);
    setSubmitError(null);

    if (!normalizedEmail) {
      setFieldError("Сначала введите email.");
      return;
    }

    if (!isValidEmail(normalizedEmail)) {
      setFieldError("Введите корректный email.");
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
        <p className="text-sm font-medium text-teal-700">Безопасный доступ</p>
        <h1 className="text-2xl font-semibold tracking-normal text-slate-950">
          Вход в Telemedicine
        </h1>
        <p className="text-sm leading-6 text-slate-600">
          Войдите в защищённый кабинет для работы с консультациями,
          сообщениями, файлами и историей обращений.
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
            label="Пароль"
            name="password"
            onChange={setPassword}
            value={password}
          />
          <button
            className="text-sm font-medium text-teal-700 transition hover:text-teal-800"
            onClick={handleForgotPassword}
            type="button"
          >
            Забыли пароль?
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
        {isPending ? "Вход..." : "Войти"}
      </button>

      <p className="mt-4 text-sm leading-6 text-slate-600">
        Нет аккаунта?{" "}
        <Link
          className="font-medium text-teal-700 hover:text-teal-800"
          href="/register"
        >
          Создать аккаунт пациента
        </Link>
      </p>
    </form>
  );
}
