"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useRef, useState } from "react";

type AttachmentFormProps = {
  consultationId: string;
};

export function AttachmentForm({ consultationId }: AttachmentFormProps) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const file = fileInputRef.current?.files?.[0];

    if (!file) {
      setError("Choose a file to upload.");
      return;
    }

    const formData = new FormData();
    formData.set("consultationId", consultationId);
    formData.set("file", file);

    setError(null);
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/files", {
        body: formData,
        method: "POST",
      });

      const payload = (await response.json().catch(() => null)) as {
        error?: string;
      } | null;

      if (!response.ok) {
        setError(payload?.error ?? "Unable to upload file.");
        return;
      }

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }

      router.refresh();
    } catch {
      setError("Unable to upload file.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form className="mt-5 space-y-3" onSubmit={handleSubmit}>
      <div>
        <label
          className="text-sm font-medium text-slate-700"
          htmlFor="attachment"
        >
          Attachment
        </label>
        <input
          accept=".pdf,.jpg,.jpeg,.png,.docx,application/pdf,image/jpeg,image/png,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
          className="mt-2 block w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 file:mr-3 file:rounded-md file:border-0 file:bg-slate-100 file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-slate-700 hover:file:bg-slate-200 disabled:cursor-not-allowed disabled:bg-slate-100"
          disabled={isSubmitting}
          id="attachment"
          name="attachment"
          ref={fileInputRef}
          type="file"
        />
        <p className="mt-2 text-xs text-slate-500">
          PDF, JPG, JPEG, PNG, or DOCX. Maximum size 10 MB.
        </p>
      </div>

      {error ? (
        <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      ) : null}

      <button
        className="inline-flex min-h-10 items-center justify-center rounded-md bg-teal-700 px-4 text-sm font-medium text-white transition hover:bg-teal-800 disabled:cursor-not-allowed disabled:bg-slate-300"
        disabled={isSubmitting}
        type="submit"
      >
        {isSubmitting ? "Uploading" : "Upload file"}
      </button>
    </form>
  );
}
