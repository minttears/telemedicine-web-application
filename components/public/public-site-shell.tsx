import type { ReactNode } from "react";
import Link from "next/link";

const publicNavItems = [
  { href: "/", label: "Главная" },
  { href: "/doctors", label: "Врачи" },
  { href: "/about", label: "О сервисе" },
  { href: "/contacts", label: "Контакты" },
];

export function PublicSiteShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-950">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-4 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <Link className="font-semibold text-teal-800" href="/">
            Онлайн-консультации
          </Link>
          <nav aria-label="Основная навигация">
            <ul className="flex flex-wrap gap-x-4 gap-y-2 text-sm">
              {publicNavItems.map((item) => (
                <li key={item.href}>
                  <Link
                    className="text-slate-600 transition hover:text-teal-700"
                    href={item.href}
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
          <div className="flex flex-wrap gap-2">
            <Link
              className="inline-flex min-h-10 items-center rounded-md border border-slate-300 bg-white px-4 text-sm font-medium text-slate-700 transition hover:border-teal-700 hover:text-teal-700"
              href="/login"
            >
              Войти
            </Link>
            <Link
              className="inline-flex min-h-10 items-center rounded-md bg-teal-700 px-4 text-sm font-medium text-white transition hover:bg-teal-800"
              href="/register"
            >
              Регистрация пациента
            </Link>
          </div>
        </div>
      </header>

      {children}

      <footer className="border-t border-slate-200 bg-white">
        <div className="mx-auto grid w-full max-w-6xl gap-4 px-4 py-8 text-sm text-slate-600 sm:px-6 md:grid-cols-2">
          <div>
            <p className="font-medium text-slate-900">
              Веб-приложение дистанционного медицинского консультирования
            </p>
            <p className="mt-2 leading-6">
              Демонстрационная версия сервиса онлайн-консультаций.
            </p>
          </div>
          <nav
            aria-label="Правовая информация"
            className="flex flex-wrap gap-x-4 gap-y-2 md:justify-end"
          >
            <Link className="hover:text-teal-700" href="/terms">
              Условия использования
            </Link>
            <Link className="hover:text-teal-700" href="/privacy">
              Политика конфиденциальности
            </Link>
            <Link className="hover:text-teal-700" href="/telemedicine-consent">
              Согласие на консультацию
            </Link>
          </nav>
        </div>
      </footer>
    </div>
  );
}
