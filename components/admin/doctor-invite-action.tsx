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
        setError(result.error ?? "Unable to create invite link.");
        return;
      }

      setInvite({
        expiresAt: result.inviteExpiresAt,
        url: result.inviteUrl,
      });
    } catch {
      setError("Unable to create invite link right now.");
    } finally {
      setIsPending(false);
    }
  }

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="text-xl font-semibold text-slate-950">Doctor invite</h2>
      <p className="mt-2 text-sm leading-6 text-slate-600">
        Generate a one-time onboarding link so this doctor can set an initial
        password. Any unused active invite link for this doctor will be
        invalidated.
      </p>

      {invite ? (
        <div className="mt-5 rounded-lg border border-teal-200 bg-teal-50 p-4">
          <h3 className="text-sm font-semibold text-teal-950">
            One-time invite link
          </h3>
          <p className="mt-2 text-sm leading-6 text-teal-900">
            Copy this link now and share it through an approved secure process.
            It will not be shown again after you leave this page.
          </p>
          <label className="mt-3 block">
            <span className="text-xs font-medium uppercase tracking-normal text-teal-900">
              Invite link
            </span>
            <input
              className="mt-2 w-full rounded-md border border-teal-200 bg-white px-3 py-2 text-sm text-slate-950"
              readOnly
              value={invite.url}
            />
          </label>
          <p className="mt-2 text-xs text-teal-900">
            Expires {new Date(invite.expiresAt).toLocaleString()}.
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
        {isPending ? "Generating..." : "Generate invite link"}
      </button>
    </section>
  );
}
