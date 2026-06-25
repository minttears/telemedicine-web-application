import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Врачи",
  description:
    "Поиск врачей для онлайн-консультации в личном кабинете пациента.",
};

export default function DoctorsPage() {
  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-12 sm:px-6">
      <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <p className="text-sm font-medium text-teal-700">Врачи</p>
        <h1 className="mt-3 text-3xl font-semibold text-slate-950">
          Найдите врача для онлайн-консультации
        </h1>
        <p className="mt-4 max-w-2xl text-base leading-7 text-slate-600">
          Подробный каталог врачей, фильтры по специальностям и симптомам, а
          также доступное время для записи находятся в защищённом личном
          кабинете пациента.
        </p>
        <div className="mt-7 flex flex-wrap gap-3">
          <Link
            className="inline-flex min-h-11 items-center rounded-md bg-teal-700 px-5 text-sm font-medium text-white hover:bg-teal-800"
            href="/login"
          >
            Войти и выбрать врача
          </Link>
          <Link
            className="inline-flex min-h-11 items-center rounded-md border border-slate-300 bg-white px-5 text-sm font-medium text-slate-700 hover:border-teal-700 hover:text-teal-700"
            href="/register"
          >
            Создать аккаунт пациента
          </Link>
        </div>
      </section>
    </main>
  );
}
