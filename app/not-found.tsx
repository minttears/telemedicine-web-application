import Link from "next/link";

export default function NotFound() {
  return (
    <main className="mx-auto max-w-5xl px-6 py-16">
      <h1 className="text-2xl font-semibold text-slate-950">
        Страница не найдена
      </h1>
      <p className="mt-3 text-sm text-slate-600">
        Запрошенная страница не существует или была перемещена.
      </p>
      <Link
        className="mt-6 inline-flex min-h-10 items-center rounded-md bg-teal-700 px-4 text-sm font-medium text-white hover:bg-teal-800"
        href="/"
      >
        На главную
      </Link>
    </main>
  );
}
