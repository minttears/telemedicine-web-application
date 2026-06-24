"use client";

import { FormEvent, useState } from "react";

import { PasswordField } from "@/components/auth/password-field";

type TwoFactorManagementProps = {
  enabledAt: string;
  initialRemainingRecoveryCodeCount: number;
};

type RegenerateResponse = {
  error?: string;
  recoveryCodes?: string[];
  remainingRecoveryCodeCount?: number;
};

export function TwoFactorManagement({
  enabledAt,
  initialRemainingRecoveryCodeCount,
}: TwoFactorManagementProps) {
  const [password, setPassword] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [remainingRecoveryCodeCount, setRemainingRecoveryCodeCount] =
    useState(initialRemainingRecoveryCodeCount);
  const [recoveryCodes, setRecoveryCodes] = useState<string[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);

  async function handleRegenerate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setRecoveryCodes(null);

    if (!password || !verificationCode.trim()) {
      setError(
        "Введите текущий пароль и код двухфакторной аутентификации.",
      );
      return;
    }

    setIsPending(true);

    try {
      const response = await fetch(
        "/api/auth/2fa/recovery-codes/regenerate",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            password,
            verificationCode: verificationCode.trim(),
          }),
        },
      );
      const result = (await response.json().catch(() => ({}))) as RegenerateResponse;

      if (
        !response.ok ||
        !result.recoveryCodes ||
        typeof result.remainingRecoveryCodeCount !== "number"
      ) {
        setError(
          result.error ??
            "Не удалось проверить пароль и код двухфакторной аутентификации.",
        );
        return;
      }

      setPassword("");
      setVerificationCode("");
      setRecoveryCodes(result.recoveryCodes);
      setRemainingRecoveryCodeCount(result.remainingRecoveryCodeCount);
    } catch {
      setError("Сейчас не удалось создать новые коды восстановления.");
    } finally {
      setIsPending(false);
    }
  }

  return (
    <div className="space-y-6">
      <section className="grid gap-4 md:grid-cols-3">
        <div className="rounded-lg border border-teal-200 bg-teal-50 p-5">
          <p className="text-sm font-medium text-teal-800">
            Статус двухфакторной аутентификации
          </p>
          <p className="mt-2 text-lg font-semibold text-teal-950">Включена</p>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-medium text-slate-600">
            Осталось кодов восстановления
          </p>
          <p className="mt-2 text-lg font-semibold text-slate-950">
            {remainingRecoveryCodeCount}
          </p>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-medium text-slate-600">Включена</p>
          <p className="mt-2 text-sm font-semibold text-slate-950">
            {new Date(enabledAt).toLocaleString("ru-RU")}
          </p>
        </div>
      </section>

      <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-xl font-semibold text-slate-950">
          Безопасность двухфакторной аутентификации
        </h2>
        <div className="mt-3 space-y-2 text-sm leading-6 text-slate-600">
          <p>
            Для проверки кодов время на вашем устройстве и сервере должно быть
            синхронизировано.
          </p>
          <p>
            Коды восстановления — одноразовый резервный способ входа. Новые
            коды показываются только один раз; сохраните их в надёжном
            менеджере паролей.
          </p>
          <p>
            Самостоятельное отключение недоступно. Если необходимо восстановить
            доступ, обратитесь к администратору.
          </p>
        </div>
      </section>

      <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-xl font-semibold text-slate-950">
          Создать новые коды восстановления
        </h2>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          Подтвердите текущий пароль и введите текущий код из
          приложения-аутентификатора или один неиспользованный код
          восстановления. Все остальные неиспользованные старые коды перестанут
          работать.
        </p>

        <form className="mt-5 max-w-lg space-y-4" onSubmit={handleRegenerate}>
          <PasswordField
            autoComplete="current-password"
            id="two-factor-current-password"
            label="Текущий пароль"
            onChange={setPassword}
            value={password}
          />
          <div className="space-y-2">
            <label
              className="text-sm font-medium text-slate-800"
              htmlFor="two-factor-verification-code"
            >
              Текущий код из приложения-аутентификатора или код восстановления
            </label>
            <input
              autoComplete="one-time-code"
              className="h-11 w-full rounded-md border border-slate-300 bg-white px-3 text-base text-slate-950 outline-none transition focus:border-teal-600 focus:ring-2 focus:ring-teal-100"
              id="two-factor-verification-code"
              onChange={(event) => setVerificationCode(event.target.value)}
              value={verificationCode}
            />
          </div>

          {error ? (
            <p
              className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700"
              role="alert"
            >
              {error}
            </p>
          ) : null}

          <button
            className="inline-flex min-h-11 items-center justify-center rounded-md bg-teal-700 px-4 text-sm font-semibold text-white transition hover:bg-teal-800 disabled:cursor-not-allowed disabled:bg-slate-300"
            disabled={isPending}
            type="submit"
          >
            {isPending ? "Проверка..." : "Создать новые коды восстановления"}
          </button>
        </form>

        {recoveryCodes ? (
          <div className="mt-6 rounded-lg border border-teal-200 bg-teal-50 p-4">
            <h3 className="text-sm font-semibold text-teal-950">
              Сохраните новые коды восстановления
            </h3>
            <p className="mt-2 text-sm leading-6 text-teal-900">
              После ухода с этой страницы или её обновления коды больше не
              будут показаны. Не отправляйте их по email и не передавайте в
              сообщениях.
            </p>
            <ul className="mt-4 grid gap-2 rounded-md border border-teal-200 bg-white p-4 font-mono text-sm text-slate-950 sm:grid-cols-2">
              {recoveryCodes.map((recoveryCode) => (
                <li key={recoveryCode}>{recoveryCode}</li>
              ))}
            </ul>
          </div>
        ) : null}
      </section>
    </div>
  );
}
