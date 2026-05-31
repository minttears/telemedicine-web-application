import { AttachmentForm } from "@/components/consultations/attachment-form";
import { MessageForm } from "@/components/consultations/message-form";
import { MessageRefresh } from "@/components/consultations/message-refresh";
import { ProfileImage } from "@/components/profile/profile-image";
import {
  formatFileSize,
  getAttachmentTypeLabel,
} from "@/lib/attachments/validation";

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

type ConsultationSummaryPanelProps = {
  additionalNotes?: string | null;
  completedAt: Date | null;
  diagnosisDetails?: string | null;
  diagnosisStatus?: string | null;
  doctorNotes: string;
  followUpInstructions?: string | null;
  medicationNotes?: string | null;
  recommendations?: string | null;
  title: string;
};

const diagnosisStatusLabels: Record<string, string> = {
  NOT_IDENTIFIED: "No diagnosis identified",
  PRELIMINARY: "Preliminary diagnosis",
  REQUIRES_FURTHER_EXAMINATION: "Requires further examination",
  CONFIRMED: "Confirmed diagnosis",
  CANNOT_DETERMINE_ONLINE: "Cannot determine online",
  REFERRED_TO_SPECIALIST: "Referred to specialist",
  NOT_APPLICABLE: "Not applicable",
};

function formatSummaryDate(value: Date) {
  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(value);
}

export function ConsultationSummaryPanel({
  additionalNotes,
  completedAt,
  diagnosisDetails,
  diagnosisStatus,
  doctorNotes,
  followUpInstructions,
  medicationNotes,
  recommendations,
  title,
}: ConsultationSummaryPanelProps) {
  const outcomeSections = [
    { body: diagnosisDetails, title: "Diagnosis details" },
    { body: recommendations, title: "Doctor recommendations" },
    { body: medicationNotes, title: "Medication notes" },
    { body: followUpInstructions, title: "Follow-up instructions" },
    { body: additionalNotes, title: "Additional notes" },
  ].filter((section) => section.body?.trim());

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-sm font-medium text-teal-700">{title}</p>
          <h2 className="mt-2 text-lg font-semibold text-slate-950">
            Consultation outcome
          </h2>
        </div>
        {completedAt ? (
          <time
            className="text-sm text-slate-500"
            dateTime={completedAt.toISOString()}
          >
            {formatSummaryDate(completedAt)}
          </time>
        ) : null}
      </div>
      <div className="mt-5 rounded-md border border-slate-200 bg-slate-50 p-4">
        <p className="text-sm font-medium text-slate-950">
          Conclusion / summary
        </p>
        <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-700">
          {doctorNotes}
        </p>
      </div>
      {diagnosisStatus ? (
        <div className="mt-3 rounded-md border border-teal-100 bg-teal-50 p-4">
          <p className="text-sm font-medium text-slate-950">Diagnosis status</p>
          <p className="mt-2 text-sm leading-6 text-teal-800">
            {diagnosisStatusLabels[diagnosisStatus] ?? diagnosisStatus}
          </p>
        </div>
      ) : null}
      {outcomeSections.length > 0 ? (
        <div className="mt-3 grid gap-3">
          {outcomeSections.map((section) => (
            <div
              className="rounded-md border border-slate-200 bg-white p-4"
              key={section.title}
            >
              <p className="text-sm font-medium text-slate-950">
                {section.title}
              </p>
              <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-700">
                {section.body}
              </p>
            </div>
          ))}
        </div>
      ) : null}
    </section>
  );
}

type ConsultationMessage = {
  attachments: {
    createdAt: Date;
    fileName: string;
    fileSize: number;
    fileType: string;
    id: string;
    uploadedBy: {
      name: string | null;
      role: string;
    };
  }[];
  body: string | null;
  createdAt: Date;
  id: string;
  sender: {
    avatarStoragePath: string | null;
    doctorProfile: {
      id: string;
      photoStoragePath: string | null;
    } | null;
    id: string;
    name: string | null;
    role: string;
  };
  type: string;
};

type ConsultationMessagesPanelProps = {
  consultationId: string;
  currentUserId: string;
  messages: ConsultationMessage[];
  readOnly?: boolean;
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

function getInitials(name: string | null, role: string) {
  return (name ?? role).slice(0, 2).toUpperCase();
}

function getSenderImageSrc(message: ConsultationMessage) {
  if (message.sender.role === "PATIENT" && message.sender.avatarStoragePath) {
    return `/api/profile-images/patient/${message.sender.id}`;
  }

  if (
    message.sender.role === "DOCTOR" &&
    message.sender.doctorProfile?.photoStoragePath
  ) {
    return `/api/profile-images/doctor/${message.sender.doctorProfile.id}`;
  }

  return undefined;
}

function MessageAvatar({ message }: { message: ConsultationMessage }) {
  const senderName = getSenderName(message);

  return (
    <ProfileImage
      alt={`${senderName} avatar`}
      className="h-9 w-9 shrink-0"
      initials={getInitials(message.sender.name, message.sender.role)}
      src={getSenderImageSrc(message)}
    />
  );
}

function FileAttachmentBubble({
  attachment,
  isCurrentUser,
}: {
  attachment: ConsultationMessage["attachments"][number];
  isCurrentUser: boolean;
}) {
  return (
    <div
      className={`rounded-md border p-3 ${
        isCurrentUser
          ? "border-teal-100 bg-white/80"
          : "border-slate-200 bg-white"
      }`}
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="break-words text-sm font-medium text-slate-950">
            {attachment.fileName}
          </p>
          <p className="mt-1 text-xs leading-5 text-slate-500">
            {getAttachmentTypeLabel(attachment.fileType)} - {formatFileSize(attachment.fileSize)} - Uploaded by {attachment.uploadedBy.name ?? attachment.uploadedBy.role} - {formatMessageDate(attachment.createdAt)}
          </p>
        </div>
        <a
          className={`inline-flex min-h-9 w-fit items-center justify-center rounded-md px-3 text-sm font-medium transition ${
            isCurrentUser
              ? "border border-teal-200 bg-white text-teal-800 hover:border-teal-700"
              : "border border-slate-300 bg-white text-slate-700 hover:border-teal-700 hover:text-teal-700"
          }`}
          href={`/api/files/${attachment.id}`}
        >
          Download
        </a>
      </div>
    </div>
  );
}

export function ConsultationMessagesPanel({
  consultationId,
  currentUserId,
  messages,
  readOnly = false,
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
        <div className="mt-5 space-y-4">
          {messages.map((message) => {
            const isCurrentUser = message.sender.id === currentUserId;
            const senderName = getSenderName(message);

            return (
              <article
                className={`flex gap-3 ${
                  isCurrentUser ? "justify-end" : "justify-start"
                }`}
                key={message.id}
              >
                {!isCurrentUser ? <MessageAvatar message={message} /> : null}
                <div
                  className={`max-w-[min(34rem,calc(100%-3rem))] ${
                    isCurrentUser ? "items-end" : "items-start"
                  } flex flex-col`}
                >
                  <div
                    className={`mb-1 flex flex-wrap items-center gap-2 text-xs ${
                      isCurrentUser ? "justify-end text-teal-800" : "text-slate-500"
                    }`}
                  >
                    <span className="font-medium">{senderName}</span>
                    <span className="rounded-full border border-slate-200 bg-white px-2 py-0.5 font-medium text-slate-600">
                      {message.sender.role}
                    </span>
                    <time dateTime={message.createdAt.toISOString()}>
                      {formatMessageDate(message.createdAt)}
                    </time>
                  </div>

                  <div
                    className={`rounded-2xl px-4 py-3 shadow-sm ${
                      isCurrentUser
                        ? "rounded-br-md border border-teal-200 bg-teal-50 text-slate-900"
                        : "rounded-bl-md border border-slate-200 bg-slate-50 text-slate-800"
                    }`}
                  >
                    {message.type === "TEXT" ? (
                      <p className="whitespace-pre-wrap text-sm leading-6">
                        {message.body}
                      </p>
                    ) : message.type === "FILE" ? (
                      <div className="space-y-2">
                        {message.attachments.length > 0 ? (
                          message.attachments.map((attachment) => (
                            <FileAttachmentBubble
                              attachment={attachment}
                              isCurrentUser={isCurrentUser}
                              key={attachment.id}
                            />
                          ))
                        ) : (
                          <p className="text-sm leading-6 text-slate-600">
                            File metadata is not available.
                          </p>
                        )}
                      </div>
                    ) : (
                      <p className="text-sm leading-6 text-slate-600">
                        This message type is not available in the chat view yet.
                      </p>
                    )}
                  </div>
                </div>
                {isCurrentUser ? <MessageAvatar message={message} /> : null}
              </article>
            );
          })}
        </div>
      ) : (
        <div className="mt-5 rounded-lg border border-dashed border-slate-300 bg-slate-50 p-5">
          <h3 className="text-sm font-semibold text-slate-950">
            No messages yet
          </h3>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            {readOnly
              ? "No messages were recorded before this consultation was completed."
              : "Messages and shared files will appear here after the consultation chat starts."}
          </p>
        </div>
      )}

      {readOnly ? (
        <div className="mt-5 rounded-lg border border-slate-200 bg-slate-50 p-4">
          <h3 className="text-sm font-semibold text-slate-950">
            Chat is read-only
          </h3>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            This consultation has been completed. The chat history remains
            available, but new messages cannot be sent.
          </p>
        </div>
      ) : (
        <>
          <MessageForm consultationId={consultationId} />
          <AttachmentForm consultationId={consultationId} />
        </>
      )}
    </section>
  );
}
