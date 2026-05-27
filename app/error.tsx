"use client";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="mx-auto max-w-5xl px-6 py-16">
      <h1 className="text-2xl font-semibold text-slate-950">
        Something went wrong
      </h1>
      <p className="mt-3 text-sm text-slate-600">{error.message}</p>
      <button
        className="mt-6 rounded-md bg-teal-700 px-4 py-2 text-sm font-medium text-white"
        type="button"
        onClick={reset}
      >
        Try again
      </button>
    </main>
  );
}
