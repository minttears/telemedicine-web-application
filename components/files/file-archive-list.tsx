import Link from "next/link";

import {
  formatFileSize,
  getAttachmentTypeLabel,
} from "@/lib/attachments/validation";

type ArchiveFile = {
  consultation: {
    href: string;
    personLabel: string;
    scheduledAt: Date;
    status: string;
  };
  createdAt: Date;
  fileName: string;
  fileSize: number;
  fileType: string;
  id: string;
  uploadedBy: {
    name: string | null;
    role: string;
  };
};

type FileArchiveListProps = {
  emptyActionHref: string;
  emptyActionLabel: string;
  emptyBody: string;
  emptyTitle: string;
  files: ArchiveFile[];
  personHeader: string;
};

function formatDateTime(value: Date) {
  return new Intl.DateTimeFormat("ru-RU", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(value);
}

function getStatusClassName(status: string) {
  if (status === "COMPLETED") {
    return "border-emerald-200 bg-emerald-50 text-emerald-700";
  }

  if (status === "IN_PROGRESS") {
    return "border-amber-200 bg-amber-50 text-amber-700";
  }

  if (status === "CANCELLED") {
    return "border-slate-200 bg-slate-100 text-slate-600";
  }

  if (status === "REQUESTED") {
    return "border-sky-200 bg-sky-50 text-sky-700";
  }

  return "border-teal-200 bg-teal-50 text-teal-700";
}

function getUploaderLabel(file: ArchiveFile) {
  const roleLabel = file.uploadedBy.role === "DOCTOR" ? "Врач" : "Пациент";

  if (!file.uploadedBy.name) {
    return roleLabel;
  }

  return `${roleLabel}: ${file.uploadedBy.name}`;
}

export function FileArchiveList({
  emptyActionHref,
  emptyActionLabel,
  emptyBody,
  emptyTitle,
  files,
  personHeader,
}: FileArchiveListProps) {
  if (files.length === 0) {
    return (
      <section className="rounded-lg border border-dashed border-slate-300 bg-white p-8 text-center shadow-sm">
        <h2 className="text-lg font-semibold text-slate-950">{emptyTitle}</h2>
        <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-slate-600">
          {emptyBody}
        </p>
        <Link
          className="mt-5 inline-flex min-h-10 items-center justify-center rounded-md bg-teal-700 px-4 text-sm font-medium text-white transition hover:bg-teal-800"
          href={emptyActionHref}
        >
          {emptyActionLabel}
        </Link>
      </section>
    );
  }

  return (
    <section aria-label="Файлы консультаций" className="grid gap-4">
      <div className="hidden rounded-lg border border-slate-200 bg-white px-5 py-3 text-xs font-medium uppercase tracking-normal text-slate-500 shadow-sm lg:grid lg:grid-cols-[minmax(0,2fr)_minmax(0,1.1fr)_minmax(0,1.1fr)_minmax(0,1.1fr)_auto] lg:gap-4">
        <span>Файл</span>
        <span>{personHeader}</span>
        <span>Консультация</span>
        <span>Отправлен</span>
        <span className="text-right">Действия</span>
      </div>

      {files.map((file) => (
        <article
          className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm"
          key={file.id}
        >
          <div className="grid gap-5 lg:grid-cols-[minmax(0,2fr)_minmax(0,1.1fr)_minmax(0,1.1fr)_minmax(0,1.1fr)_auto] lg:items-center lg:gap-4">
            <div>
              <p className="break-words text-base font-semibold text-slate-950">
                {file.fileName}
              </p>
              <p className="mt-1 text-sm text-slate-500">
                {getAttachmentTypeLabel(file.fileType)} - {formatFileSize(file.fileSize)}
              </p>
            </div>

            <div>
              <p className="text-xs font-medium uppercase tracking-normal text-slate-500 lg:hidden">
                {personHeader}
              </p>
              <p className="mt-1 text-sm text-slate-700 lg:mt-0">
                {file.consultation.personLabel}
              </p>
            </div>

            <div>
              <p className="text-xs font-medium uppercase tracking-normal text-slate-500 lg:hidden">
                Консультация
              </p>
              <p className="mt-1 text-sm text-slate-700 lg:mt-0">
                {formatDateTime(file.consultation.scheduledAt)}
              </p>
              <span
                className={`mt-2 inline-flex w-fit rounded-full border px-2.5 py-1 text-xs font-medium ${getStatusClassName(
                  file.consultation.status,
                )}`}
              >
                {{
                  CANCELLED: "Отменена",
                  COMPLETED: "Завершена",
                  IN_PROGRESS: "Идёт сейчас",
                  REQUESTED: "Ожидает подтверждения",
                  SCHEDULED: "Запланирована",
                }[file.consultation.status] ?? file.consultation.status}
              </span>
            </div>

            <div>
              <p className="text-xs font-medium uppercase tracking-normal text-slate-500 lg:hidden">
                Отправлен
              </p>
              <p className="mt-1 text-sm text-slate-700 lg:mt-0">
                {formatDateTime(file.createdAt)}
              </p>
              <p className="mt-1 text-xs text-slate-500">
                {getUploaderLabel(file)}
              </p>
            </div>

            <div className="flex flex-wrap gap-2 lg:justify-end">
              <Link
                className="inline-flex min-h-10 items-center justify-center rounded-md border border-slate-300 bg-white px-3 text-sm font-medium text-slate-700 transition hover:border-teal-700 hover:text-teal-700"
                href={file.consultation.href}
              >
                Открыть консультацию
              </Link>
              <a
                className="inline-flex min-h-10 items-center justify-center rounded-md bg-teal-700 px-3 text-sm font-medium text-white transition hover:bg-teal-800"
                href={`/api/files/${file.id}`}
              >
                Скачать
              </a>
            </div>
          </div>
        </article>
      ))}
    </section>
  );
}
