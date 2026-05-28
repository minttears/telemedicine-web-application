import { MessageForm } from "@/components/consultations/message-form";
import { MessageRefresh } from "@/components/consultations/message-refresh";

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

type ConsultationMessage = {
  body: string | null;
  createdAt: Date;
  id: string;
  sender: {
    name: string | null;
    role: string;
  };
};

type ConsultationMessagesPanelProps = {
  consultationId: string;
  messages: ConsultationMessage[];
};

function formatMessageDate(value: Date) {
  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(value);
}

function getSenderName(message: ConsultationMessage) {
  if (message.sender.name) {
    return message.sender.name;
  }

  if (message.sender.role === "DOCTOR") {
    return "Doctor";
  }

  if (message.sender.role === "PATIENT") {
    return "Patient";
  }

  return "User";
}

export function ConsultationMessagesPanel({
  consultationId,
  messages,
}: ConsultationMessagesPanelProps) {
  return (
    <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
      <MessageRefresh />
      <div>
        <p className="text-sm font-medium text-teal-700">Consultation chat</p>
        <h2 className="mt-2 text-lg font-semibold text-slate-950">
          Messages
        </h2>
      </div>

      {messages.length > 0 ? (
        <div className="mt-5 space-y-3">
          {messages.map((message) => (
            <article
              className="rounded-lg border border-slate-200 bg-slate-50 p-4"
              key={message.id}
            >
              <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm font-medium text-slate-900">
                  {getSenderName(message)}
                  <span className="ml-2 rounded-full border border-slate-200 bg-white px-2 py-0.5 text-xs font-medium text-slate-600">
                    {message.sender.role}
                  </span>
                </p>
                <time
                  className="text-xs text-slate-500"
                  dateTime={message.createdAt.toISOString()}
                >
                  {formatMessageDate(message.createdAt)}
                </time>
              </div>
              <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-slate-700">
                {message.body}
              </p>
            </article>
          ))}
        </div>
      ) : (
        <div className="mt-5 rounded-lg border border-dashed border-slate-300 bg-slate-50 p-5">
          <h3 className="text-sm font-semibold text-slate-950">
            No messages yet
          </h3>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Send a text message to start the consultation chat.
          </p>
        </div>
      )}

      <MessageForm consultationId={consultationId} />
    </section>
  );
}
