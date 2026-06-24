"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { PasswordField } from "@/components/auth/password-field";

type RegisterResponse = {
  redirectTo?: string;
  error?: string;
};

const duplicateEmailMessage =
  "Не удалось зарегистрировать аккаунт с этим email.";

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
  const [legalConsentAccepted, setLegalConsentAccepted] = useState(false);
  const [fieldError, setFieldError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const normalizedEmail = email.trim().toLowerCase();

    setFieldError(null);
    setSubmitError(null);

    if (!normalizedEmail || !password || !confirmPassword) {
      setFieldError("Введите email, пароль и подтверждение пароля.");
      return;
    }

    if (!isValidEmail(normalizedEmail)) {
      setFieldError("Введите корректный email.");
      return;
    }

    if (password.length < 8) {
      setFieldError("Пароль должен содержать не менее 8 символов.");
      return;
    }

    if (password !== confirmPassword) {
      setFieldError("Пароли должны совпадать.");
      return;
    }

    if (!legalConsentAccepted) {
      setFieldError("Примите правовые условия перед созданием аккаунта.");
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
          legalConsentAccepted,
          password,
          confirmPassword,
        }),
      });

      const result = (await response.json().catch(() => ({}))) as RegisterResponse;

      if (!response.ok) {
        setSubmitError(
          response.status === 409
            ? duplicateEmailMessage
            : result.error ?? "Не удалось зарегистрироваться с этими данными.",
        );
        return;
      }

      router.replace(result.redirectTo ?? "/patient/dashboard");
    } catch {
      setSubmitError("Сейчас не удалось зарегистрироваться. Повторите попытку.");
    } finally {
      setIsPending(false);
    }
  }

  return (
    <form
      className="w-full max-w-md rounded-lg border border-slate-200 bg-white p-6 shadow-sm"
      noValidate
      onSubmit={handleSubmit}
    >
      <div className="space-y-2">
        <p className="text-sm font-medium text-teal-700">
          Регистрация пациента
        </p>
        <h1 className="text-2xl font-semibold tracking-normal text-slate-950">
          Создание аккаунта пациента
        </h1>
        <p className="text-sm leading-6 text-slate-600">
          Самостоятельная регистрация доступна только пациентам.
        </p>
      </div>

      <div className="mt-6 space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-800" htmlFor="name">
            ФИО
          </label>
          <input
            autoComplete="name"
            className="h-11 w-full rounded-md border border-slate-300 bg-white px-3 text-base text-slate-950 outline-none transition focus:border-teal-600 focus:ring-2 focus:ring-teal-100"
            id="name"
            maxLength={100}
            name="name"
            onChange={(event) => setName(event.target.value)}
            placeholder="Ваше имя"
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
              Дата рождения
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
              Пол
            </label>
            <select
              className="h-11 w-full rounded-md border border-slate-300 bg-white px-3 text-base text-slate-950 outline-none transition focus:border-teal-600 focus:ring-2 focus:ring-teal-100"
              id="gender"
              name="gender"
              onChange={(event) => setGender(event.target.value)}
              value={gender}
            >
              <option value="">Не указывать</option>
              <option value="Female">Женский</option>
              <option value="Male">Мужской</option>
              <option value="Other">Другой</option>
            </select>
          </div>
        </div>

        <PasswordField
          autoComplete="new-password"
          helpText="Используйте не менее 8 символов."
          id="password"
          label="Пароль"
          name="password"
          onChange={setPassword}
          value={password}
        />

        <PasswordField
          autoComplete="new-password"
          id="confirmPassword"
          label="Подтвердите пароль"
          name="confirmPassword"
          onChange={setConfirmPassword}
          value={confirmPassword}
        />

        <label className="flex gap-3 rounded-md border border-slate-200 bg-slate-50 p-3 text-sm leading-6 text-slate-700">
          <input
            checked={legalConsentAccepted}
            className="mt-1 h-4 w-4 rounded border-slate-300 text-teal-700 focus:ring-teal-600"
            name="legalConsentAccepted"
            onChange={(event) => setLegalConsentAccepted(event.target.checked)}
            required
            type="checkbox"
          />
          <span>
            Я ознакомлен(а) и принимаю{" "}
            <Link className="font-medium text-teal-700 hover:text-teal-800" href="/terms">
              Условия использования
            </Link>
            ,{" "}
            <Link className="font-medium text-teal-700 hover:text-teal-800" href="/privacy">
              Политику конфиденциальности
            </Link>
            {" "}и{" "}
            <Link
              className="font-medium text-teal-700 hover:text-teal-800"
              href="/telemedicine-consent"
            >
              Согласие на проведение телемедицинской консультации
            </Link>
            .
          </span>
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
        {isPending ? "Создание аккаунта..." : "Создать аккаунт пациента"}
      </button>

      <p className="mt-4 text-sm leading-6 text-slate-600">
        Уже есть аккаунт?{" "}
        <Link className="font-medium text-teal-700 hover:text-teal-800" href="/login">
          Войти
        </Link>
      </p>
    </form>
  );
}
