import Link from "next/link";

type VideoCallPanelProps = {
  callHref: string;
  disabledReason?: string;
  isEligible: boolean;
  role: "DOCTOR" | "PATIENT";
};

export function VideoCallPanel({
  callHref,
  disabledReason,
  isEligible,
  role,
}: VideoCallPanelProps) {
  const buttonLabel = role === "DOCTOR" ? "Start video call" : "Join video call";

  return (
    <section className="rounded-lg border border-teal-100 bg-teal-50 p-6 shadow-sm">
      <p className="text-sm font-medium text-teal-800">Video consultation</p>
      <h2 className="mt-2 text-lg font-semibold text-slate-950">
        LiveKit video call
      </h2>
      <p className="mt-3 text-sm leading-6 text-slate-700">
        Private LiveKit rooms and short-lived server-issued participant tokens
        are used for eligible scheduled consultations. Tokens are never shown on
        this page.
      </p>
      {isEligible ? (
        <Link
          className="mt-5 inline-flex min-h-10 w-fit items-center justify-center rounded-md bg-teal-700 px-4 text-sm font-medium text-white transition hover:bg-teal-800"
          href={callHref}
        >
          {buttonLabel}
        </Link>
      ) : (
        <button
          className="mt-5 inline-flex min-h-10 w-fit cursor-not-allowed items-center justify-center rounded-md bg-slate-300 px-4 text-sm font-medium text-slate-600"
          disabled
          type="button"
        >
          {buttonLabel}
        </button>
      )}
      {!isEligible && disabledReason ? (
        <p className="mt-3 text-sm leading-6 text-slate-600">{disabledReason}</p>
      ) : null}
    </section>
  );
}
