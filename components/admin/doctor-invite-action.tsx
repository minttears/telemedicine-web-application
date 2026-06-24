"use client";

import { useState } from "react";

type DoctorInviteActionProps = {
  doctorId: string;
};

type InviteResponse = {
  error?: string;
  inviteExpiresAt?: string;
  inviteUrl?: string;
};

export function DoctorInviteAction({ doctorId }: DoctorInviteActionProps) {
  const [invite, setInvite] = useState<{
    expiresAt: string;
    url: string;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);

  async function handleGenerateInvite() {
    setError(null);
    setInvite(null);
    setIsPending(true);

    try {
      const response = await fetch(`/api/admin/doctors/${doctorId}/invite`, {
        method: "POST",
      });
      const result = (await response.json().catch(() => ({}))) as InviteResponse;

      if (!response.ok || !result.inviteUrl || !result.inviteExpiresAt) {
        setError(result.error ?? "Не удалось создать ссылку-приглашение.");
        return;
      }

      setInvite({
        expiresAt: result.inviteExpiresAt,
        url: result.inviteUrl,
      });
    } catch {
      setError("Сейчас не удалось создать ссылку-приглашение.");
    } finally {
      setIsPending(false);
    }
  }

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="text-xl font-semibold text-slate-950">
        Приглашение врача
      </h2>
      <p className="mt-2 text-sm leading-6 text-slate-600">
        Создайте одноразовую ссылку, по которой врач сможет задать первый
        пароль. Все ранее созданные неиспользованные приглашения для этого врача
        будут аннулированы.
      </p>

      {invite ? (
        <div className="mt-5 rounded-lg border border-teal-200 bg-teal-50 p-4">
          <h3 className="text-sm font-semibold text-teal-950">
            Одноразовая ссылка-приглашение
          </h3>
          <p className="mt-2 text-sm leading-6 text-teal-900">
            Скопируйте ссылку сейчас и передайте её по согласованному
            защищённому каналу. После ухода с этой страницы ссылка больше не
            будет показана.
          </p>
          <label className="mt-3 block">
            <span className="text-xs font-medium uppercase tracking-normal text-teal-900">
              Ссылка-приглашение
            </span>
            <input
              className="mt-2 w-full rounded-md border border-teal-200 bg-white px-3 py-2 text-sm text-slate-950"
              readOnly
              value={invite.url}
            />
          </label>
          <p className="mt-2 text-xs text-teal-900">
            Действует до{" "}
            {new Date(invite.expiresAt).toLocaleString("ru-RU")}.
          </p>
        </div>
      ) : null}

      {error ? (
        <p className="mt-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      ) : null}

      <button
        className="mt-5 inline-flex min-h-11 items-center justify-center rounded-md bg-teal-700 px-4 text-sm font-medium text-white transition hover:bg-teal-800 disabled:cursor-not-allowed disabled:bg-slate-300"
        disabled={isPending}
        onClick={handleGenerateInvite}
        type="button"
      >
        {isPending ? "Создание..." : "Создать ссылку-приглашение"}
      </button>
    </section>
  );
}
