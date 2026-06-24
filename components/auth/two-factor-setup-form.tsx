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
        setError(
          result.error ?? "Не удалось начать настройку двухфакторной аутентификации.",
        );
        return;
      }

      setManualKey(result.manualKey);
      setQrDataUrl(result.qrDataUrl);
    } catch {
      setError("Не удалось начать настройку двухфакторной аутентификации.");
    } finally {
      setIsStarting(false);
    }
  }

  async function confirmSetup(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    if (!/^\d{6}$/.test(code)) {
      setError("Введите 6-значный код из приложения-аутентификатора.");
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
        setError(
          result.error ??
            "Не удалось завершить настройку двухфакторной аутентификации.",
        );
        return;
      }

      setManualKey(null);
      setQrDataUrl(null);
      setRecoveryCodes(result.recoveryCodes);
      setRedirectTo(result.redirectTo ?? "/login");
    } catch {
      setError("Не удалось завершить настройку двухфакторной аутентификации.");
    } finally {
      setIsConfirming(false);
    }
  }

  if (recoveryCodes) {
    return (
      <section className="w-full max-w-lg rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-sm font-medium text-teal-700">
          Настройка завершена
        </p>
        <h1 className="mt-2 text-2xl font-semibold text-slate-950">
          Сохраните коды восстановления
        </h1>
        <p className="mt-3 text-sm leading-6 text-slate-600">
          Сохраните коды в надёжном менеджере паролей. Каждый код можно
          использовать только один раз. После ухода с этой страницы коды
          больше не будут показаны.
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
          Перейти в кабинет
        </button>
      </section>
    );
  }

  return (
    <section className="w-full max-w-lg rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
      <p className="text-sm font-medium text-teal-700">
        Обязательная настройка безопасности
      </p>
      <h1 className="mt-2 text-2xl font-semibold text-slate-950">
        Настройте двухфакторную аутентификацию
      </h1>
      <p className="mt-3 text-sm leading-6 text-slate-600">
        Используйте приложение-аутентификатор с поддержкой TOTP. Настройка
        обязательна для доступа к кабинету. Не передавайте QR-код и ключ
        настройки другим лицам.
      </p>

      {!manualKey || !qrDataUrl ? (
        <button
          className="mt-6 h-11 w-full rounded-md bg-teal-700 px-4 text-sm font-semibold text-white hover:bg-teal-800 disabled:bg-slate-300"
          disabled={isStarting}
          onClick={startSetup}
          type="button"
        >
          {isStarting ? "Подготовка..." : "Начать настройку"}
        </button>
      ) : (
        <form className="mt-6 space-y-5" onSubmit={confirmSetup}>
          <div className="flex justify-center rounded-md border border-slate-200 bg-white p-4">
            {/* The QR data URL is returned once by the authenticated setup API. */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              alt="QR-код для настройки приложения-аутентификатора"
              height={240}
              src={qrDataUrl}
              width={240}
            />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-800">
              Ключ для ручной настройки
            </p>
            <p className="mt-2 break-all rounded-md bg-slate-100 px-3 py-2 font-mono text-sm text-slate-900">
              {manualKey}
            </p>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-800" htmlFor="setup-code">
              Код подтверждения
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
            {isConfirming
              ? "Проверка..."
              : "Включить двухфакторную аутентификацию"}
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
