type ConsultationStatusBadgeProps = {
  status: string;
};

const statusStyles: Record<string, string> = {
  REQUESTED: "border-sky-200 bg-sky-50 text-sky-700",
  SCHEDULED: "border-teal-200 bg-teal-50 text-teal-700",
  IN_PROGRESS: "border-amber-200 bg-amber-50 text-amber-700",
  COMPLETED: "border-emerald-200 bg-emerald-50 text-emerald-700",
  CANCELLED: "border-slate-200 bg-slate-100 text-slate-600",
};

export function ConsultationStatusBadge({
  status,
}: ConsultationStatusBadgeProps) {
  return (
    <span
      className={`inline-flex w-fit rounded-full border px-3 py-1 text-xs font-medium ${
        statusStyles[status] ?? "border-slate-200 bg-slate-100 text-slate-600"
      }`}
    >
      {status}
    </span>
  );
}

type PlaceholderPanelProps = {
  body: string;
  title: string;
};

export function PlaceholderPanel({ body, title }: PlaceholderPanelProps) {
  return (
    <section className="rounded-lg border border-dashed border-slate-300 bg-white p-6">
      <h2 className="text-lg font-semibold text-slate-950">{title}</h2>
      <p className="mt-3 text-sm leading-6 text-slate-600">{body}</p>
    </section>
  );
}
