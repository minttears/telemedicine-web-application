import Link from "next/link";

import { PublicSiteShell } from "@/components/public/public-site-shell";

export default function HomePage() {
  return (
    <PublicSiteShell>
      <main>
        <section className="mx-auto grid w-full max-w-6xl gap-10 px-4 py-16 sm:px-6 lg:grid-cols-[1.2fr_0.8fr] lg:items-center lg:py-24">
          <div>
            <p className="text-sm font-medium text-teal-700">
              Веб-приложение дистанционного медицинского консультирования
            </p>
            <h1 className="mt-4 max-w-3xl text-4xl font-semibold tracking-tight text-slate-950 sm:text-5xl">
              Онлайн-консультации с врачами в защищённом личном кабинете
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-7 text-slate-600">
              Выбирайте врача, записывайтесь на удобное время, обменивайтесь
              сообщениями и файлами и сохраняйте историю обращений в одном
              месте.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                className="inline-flex min-h-11 items-center rounded-md bg-teal-700 px-5 text-sm font-medium text-white transition hover:bg-teal-800"
                href="/register"
              >
                Создать аккаунт пациента
              </Link>
              <Link
                className="inline-flex min-h-11 items-center rounded-md border border-slate-300 bg-white px-5 text-sm font-medium text-slate-700 transition hover:border-teal-700 hover:text-teal-700"
                href="/login"
              >
                Войти в личный кабинет
              </Link>
            </div>
          </div>
          <aside className="rounded-xl border border-teal-100 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-950">
              Возможности сервиса
            </h2>
            <ul className="mt-4 space-y-3 text-sm leading-6 text-slate-600">
              <li>Поиск врача по специальности и симптомам.</li>
              <li>Запись на доступное время онлайн-консультации.</li>
              <li>Защищённые сообщения, файлы и видеозвонки.</li>
              <li>История консультаций и рекомендации врача.</li>
            </ul>
            <p className="mt-5 border-t border-slate-200 pt-5 text-sm leading-6 text-slate-500">
              Сервис не предназначен для экстренной медицинской помощи.
            </p>
          </aside>
        </section>
      </main>
    </PublicSiteShell>
  );
}
