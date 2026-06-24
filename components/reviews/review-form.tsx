"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

const MAX_REVIEW_COMMENT_LENGTH = 1000;
const ratingOptions = [1, 2, 3, 4, 5];

type ReviewFormProps = {
  consultationId: string;
};

export function ReviewForm({ consultationId }: ReviewFormProps) {
  const router = useRouter();
  const [comment, setComment] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [rating, setRating] = useState(5);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const trimmedComment = comment.trim();

    if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
      setError("Выберите оценку от 1 до 5.");
      return;
    }

    if (trimmedComment.length > MAX_REVIEW_COMMENT_LENGTH) {
      setError(
        `Комментарий должен содержать не более ${MAX_REVIEW_COMMENT_LENGTH} символов.`,
      );
      return;
    }

    setError(null);
    setIsSubmitting(true);

    try {
      const response = await fetch(
        `/api/consultations/${consultationId}/review`,
        {
          body: JSON.stringify({
            comment: trimmedComment,
            rating,
          }),
          headers: {
            "Content-Type": "application/json",
          },
          method: "POST",
        },
      );

      const payload = (await response.json().catch(() => null)) as {
        error?: string;
      } | null;

      if (!response.ok) {
        setError(payload?.error ?? "Не удалось отправить отзыв.");
        return;
      }

      setComment("");
      router.refresh();
    } catch {
      setError("Не удалось отправить отзыв. Повторите попытку.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
      <div>
        <p className="text-sm font-medium text-teal-700">Отзыв о враче</p>
        <h2 className="mt-2 text-lg font-semibold text-slate-950">
          Оцените завершённую консультацию
        </h2>
        <p className="mt-3 text-sm leading-6 text-slate-600">
          Ваш отзыв поможет другим пациентам выбрать врача. Публично автор
          отображается как «Подтверждённый пациент».
        </p>
      </div>

      <form className="mt-5 space-y-4" onSubmit={handleSubmit}>
        <fieldset disabled={isSubmitting}>
          <legend className="text-sm font-medium text-slate-700">
            Оценка
          </legend>
          <div className="mt-2 flex flex-wrap gap-2">
            {ratingOptions.map((option) => (
              <label
                className={`inline-flex min-h-10 cursor-pointer items-center rounded-md border px-4 text-sm font-medium transition ${
                  rating === option
                    ? "border-teal-700 bg-teal-50 text-teal-800"
                    : "border-slate-300 bg-white text-slate-700 hover:border-teal-700 hover:text-teal-700"
                }`}
                key={option}
              >
                <input
                  checked={rating === option}
                  className="sr-only"
                  name="rating"
                  onChange={() => setRating(option)}
                  type="radio"
                  value={option}
                />
                {option}
              </label>
            ))}
          </div>
        </fieldset>

        <div>
          <label className="text-sm font-medium text-slate-700" htmlFor="comment">
            Комментарий (необязательно)
          </label>
          <textarea
            className="mt-2 min-h-32 w-full resize-y rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-teal-700 focus:ring-2 focus:ring-teal-100"
            disabled={isSubmitting}
            id="comment"
            maxLength={MAX_REVIEW_COMMENT_LENGTH}
            name="comment"
            onChange={(event) => setComment(event.target.value)}
            placeholder="Кратко расскажите о консультации"
            value={comment}
          />
          <p className="mt-2 text-xs text-slate-500">
            {comment.trim().length}/{MAX_REVIEW_COMMENT_LENGTH} символов
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
          {isSubmitting ? "Отправка..." : "Отправить отзыв"}
        </button>
      </form>
    </section>
  );
}
