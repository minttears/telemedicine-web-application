import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Контакты",
  description: "Контактная информация демонстрационного сервиса.",
};

export default function ContactsPage() {
  return (
    <main className="mx-auto w-full max-w-4xl px-4 py-12 sm:px-6">
      <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <p className="text-sm font-medium text-teal-700">Контакты</p>
        <h1 className="mt-3 text-3xl font-semibold text-slate-950">
          Связь с оператором сервиса
        </h1>
        <p className="mt-4 max-w-2xl text-base leading-7 text-slate-600">
          Публичные контактные данные и часы поддержки будут добавлены перед
          запуском сервиса. Не отправляйте медицинские документы или
          конфиденциальные сведения через незащищённые каналы связи.
        </p>
        <div className="mt-6 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-900">
          В экстренной ситуации обратитесь в местную службу экстренной помощи
          или ближайшую медицинскую организацию.
        </div>
      </section>
    </main>
  );
}
