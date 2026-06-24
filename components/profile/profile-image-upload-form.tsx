"use client";

import { FormEvent, useRef, useState } from "react";
import { useRouter } from "next/navigation";

type ProfileImageUploadFormProps = {
  description: string;
  endpoint: string;
  imageAlt: string;
  imageSrc?: string;
  initials: string;
  title: string;
};

type UploadResponse = {
  error?: string;
};

export function ProfileImageUploadForm({
  description,
  endpoint,
  imageAlt,
  imageSrc,
  initials,
  title,
}: ProfileImageUploadFormProps) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const inputId = `profile-image-${endpoint.replace(/[^a-z0-9]/gi, "-")}`;
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const file = fileInputRef.current?.files?.[0];

    setError(null);
    setSuccessMessage(null);

    if (!file) {
      setError("Выберите изображение для загрузки.");
      return;
    }

    const formData = new FormData();
    formData.set("image", file);
    setIsPending(true);

    try {
      const response = await fetch(endpoint, {
        body: formData,
        method: "POST",
      });
      const result = (await response.json().catch(() => ({}))) as UploadResponse;

      if (!response.ok) {
        setError(result.error ?? "Не удалось загрузить изображение.");
        return;
      }

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }

      setSuccessMessage("Изображение обновлено.");
      router.refresh();
    } catch {
      setError("Сейчас не удалось загрузить изображение. Повторите попытку.");
    } finally {
      setIsPending(false);
    }
  }

  return (
    <form
      className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm"
      onSubmit={handleSubmit}
    >
      <div>
        <p className="text-sm font-medium text-teal-700">
          Изображение профиля
        </p>
        <h2 className="mt-2 text-xl font-semibold text-slate-950">{title}</h2>
        <p className="mt-2 text-sm leading-6 text-slate-600">{description}</p>
      </div>

      <div className="mt-5 flex items-center gap-4">
        {imageSrc ? (
          // eslint-disable-next-line @next/next/no-img-element -- Images are served through authorized API routes that require cookies.
          <img
            alt={imageAlt}
            className="h-24 w-24 rounded-full border border-slate-200 object-cover"
            src={imageSrc}
          />
        ) : (
          <div className="flex h-24 w-24 items-center justify-center rounded-full border border-slate-200 bg-slate-100 text-xl font-semibold text-slate-500">
            {initials}
          </div>
        )}
        <div className="text-sm leading-6 text-slate-600">
          <p>JPEG, PNG или WEBP.</p>
          <p>Максимальный размер — 2 MB.</p>
        </div>
      </div>

      <div className="mt-5">
        <label className="text-sm font-medium text-slate-800" htmlFor={inputId}>
          Загрузить изображение
        </label>
        <input
          accept="image/jpeg,image/png,image/webp,.jpg,.jpeg,.png,.webp"
          className="mt-2 block w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 file:mr-3 file:rounded-md file:border-0 file:bg-slate-100 file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-slate-700 hover:file:bg-slate-200 disabled:cursor-not-allowed disabled:bg-slate-100"
          disabled={isPending}
          id={inputId}
          name="image"
          ref={fileInputRef}
          type="file"
        />
      </div>

      {error ? (
        <p className="mt-5 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      ) : null}

      {successMessage ? (
        <p className="mt-5 rounded-md border border-teal-200 bg-teal-50 px-3 py-2 text-sm text-teal-700">
          {successMessage}
        </p>
      ) : null}

      <div className="mt-6 flex justify-end">
        <button
          className="inline-flex min-h-11 items-center justify-center rounded-md bg-teal-700 px-4 text-sm font-medium text-white transition hover:bg-teal-800 disabled:cursor-not-allowed disabled:bg-slate-300"
          disabled={isPending}
          type="submit"
        >
          {isPending ? "Загрузка..." : "Загрузить изображение"}
        </button>
      </div>
    </form>
  );
}
