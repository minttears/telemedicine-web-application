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
  return `Если аккаунт с email ${email} существует, инструкции для сброса пароля отправлены.`;
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
      setFieldError("Введите корректный email.");
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
        setSubmitError(result?.error ?? "Не удалось обработать запрос.");
        return;
      }

      setSuccessMessage(buildGenericMessage(normalizedEmail));
    } catch {
      setSubmitError("Сейчас не удалось обработать запрос.");
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
        <p className="text-sm font-medium text-teal-700">Сброс пароля</p>
        <h1 className="text-2xl font-semibold tracking-normal text-slate-950">
          Забыли пароль?
        </h1>
        <p className="text-sm leading-6 text-slate-600">
          Если аккаунт существует и для него доступно восстановление,
          инструкции будут отправлены только на указанный email.
        </p>
      </div>

      <div className="mt-6 rounded-md border border-slate-200 bg-slate-50 px-3 py-3">
        <p className="text-xs font-medium uppercase tracking-normal text-slate-500">
          Email аккаунта
        </p>
        <p className="mt-1 break-words text-sm font-medium text-slate-950">
          {normalizedEmail || "Email не выбран"}
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
        {isPending ? "Отправка..." : "Отправить инструкции"}
      </button>

      <p className="mt-4 text-sm leading-6 text-slate-600">
        Нужно указать другой email?{" "}
        <Link className="font-medium text-teal-700 hover:text-teal-800" href="/login">
          Вернуться ко входу
        </Link>
      </p>
    </form>
  );
}
