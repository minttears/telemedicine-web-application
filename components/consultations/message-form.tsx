"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

const MAX_MESSAGE_LENGTH = 2000;

type MessageFormProps = {
  consultationId: string;
};

export function MessageForm({ consultationId }: MessageFormProps) {
  const router = useRouter();
  const [body, setBody] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const trimmedBody = body.trim();

    if (trimmedBody.length === 0) {
      setError("Введите текст сообщения.");
      return;
    }

    if (trimmedBody.length > MAX_MESSAGE_LENGTH) {
      setError(
        `Текст сообщения должен содержать не более ${MAX_MESSAGE_LENGTH} символов.`,
      );
      return;
    }

    setError(null);
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/messages", {
        body: JSON.stringify({
          body: trimmedBody,
          consultationId,
        }),
        headers: {
          "Content-Type": "application/json",
        },
        method: "POST",
      });

      const payload = (await response.json().catch(() => null)) as {
        error?: string;
      } | null;

      if (!response.ok) {
        setError(payload?.error ?? "Не удалось отправить сообщение.");
        return;
      }

      setBody("");
      router.refresh();
    } catch {
      setError("Не удалось отправить сообщение. Повторите попытку.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form className="mt-5 space-y-3" onSubmit={handleSubmit}>
      <div>
        <label className="text-sm font-medium text-slate-700" htmlFor="message">
          Сообщение
        </label>
        <textarea
          className="mt-2 min-h-28 w-full resize-y rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-teal-700 focus:ring-2 focus:ring-teal-100"
          disabled={isSubmitting}
          id="message"
          name="message"
          onChange={(event) => setBody(event.target.value)}
          placeholder="Введите сообщение"
          value={body}
        />
        <p className="mt-2 text-xs text-slate-500">
          {body.trim().length}/{MAX_MESSAGE_LENGTH} символов
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
        {isSubmitting ? "Отправка..." : "Отправить сообщение"}
      </button>
    </form>
  );
}
