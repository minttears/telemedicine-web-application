import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Профиль врача",
  description:
    "Информация о враче и запись на онлайн-консультацию доступны пациентам после входа.",
};

export default function PublicDoctorProfilePage() {
  return (
    <main className="mx-auto w-full max-w-4xl px-4 py-12 sm:px-6">
      <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <p className="text-sm font-medium text-teal-700">Профиль врача</p>
        <h1 className="mt-3 text-3xl font-semibold text-slate-950">
          Информация доступна в личном кабинете пациента
        </h1>
        <p className="mt-4 max-w-2xl text-base leading-7 text-slate-600">
          Войдите, чтобы посмотреть сведения о враче, отзывы и доступное время
          для записи на онлайн-консультацию.
        </p>
        <Link
          className="mt-7 inline-flex min-h-11 items-center rounded-md bg-teal-700 px-5 text-sm font-medium text-white hover:bg-teal-800"
          href="/login"
        >
          Войти в личный кабинет
        </Link>
      </section>
    </main>
  );
}
