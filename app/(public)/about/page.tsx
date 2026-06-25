import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "О сервисе",
  description:
    "Информация о возможностях демонстрационного сервиса онлайн-консультаций.",
};

export default function AboutPage() {
  return (
    <main className="mx-auto w-full max-w-4xl px-4 py-12 sm:px-6">
      <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <p className="text-sm font-medium text-teal-700">О сервисе</p>
        <h1 className="mt-3 text-3xl font-semibold text-slate-950">
          Онлайн-консультации в едином рабочем пространстве
        </h1>
        <p className="mt-4 text-base leading-7 text-slate-600">
          Сервис помогает пациентам находить врачей, записываться на
          консультации и безопасно обмениваться сообщениями и файлами. Врачи
          управляют расписанием, проводят видеозвонки и сохраняют рекомендации
          по завершённым консультациям.
        </p>
        <p className="mt-4 text-sm leading-6 text-slate-600">
          Это демонстрационная MVP-версия. Она не заменяет экстренную или
          очную медицинскую помощь и требует дополнительной юридической,
          клинической и эксплуатационной подготовки перед реальным запуском.
        </p>
      </section>
    </main>
  );
}
