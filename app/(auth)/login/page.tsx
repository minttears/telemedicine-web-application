import { redirect } from "next/navigation";

import { LoginForm } from "@/components/auth/login-form";
import { getCurrentUser, getRedirectPathForRole } from "@/lib/auth/current-user";

type LoginPageProps = {
  searchParams: Promise<{
    passwordSet?: string;
    passwordReset?: string;
  }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const [currentUser, { passwordReset, passwordSet }] = await Promise.all([
    getCurrentUser(),
    searchParams,
  ]);

  if (currentUser) {
    redirect(getRedirectPathForRole(currentUser.role));
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-10">
      <section className="grid w-full max-w-5xl gap-8 lg:grid-cols-[1fr_440px] lg:items-center">
        <div className="max-w-xl">
          <p className="text-sm font-medium text-teal-700">
            Веб-приложение дистанционного медицинского консультирования
          </p>
          <h1 className="mt-3 text-4xl font-semibold tracking-normal text-slate-950">
            Личный кабинет для онлайн-консультаций
          </h1>
          <p className="mt-4 text-base leading-7 text-slate-600">
            Войдите, чтобы работать с консультациями, сообщениями, файлами,
            расписанием и историей обращений.
          </p>
          <p className="mt-6 text-sm leading-6 text-slate-500">
            Перед использованием ознакомьтесь с{" "}
            <a className="font-medium text-teal-700 hover:text-teal-800" href="/terms">
              Условия использования
            </a>
            , {" "}
            <a className="font-medium text-teal-700 hover:text-teal-800" href="/privacy">
              Политика конфиденциальности
            </a>
            {" "}и{" "}
            <a
              className="font-medium text-teal-700 hover:text-teal-800"
              href="/telemedicine-consent"
            >
              Согласием на проведение телемедицинской консультации
            </a>
            .
          </p>
        </div>

        <div>
          {passwordSet ? (
            <p className="mb-4 rounded-md border border-teal-200 bg-teal-50 px-4 py-3 text-sm text-teal-800">
              Пароль задан. Войдите с новым паролем.
            </p>
          ) : null}
          {passwordReset ? (
            <p className="mb-4 rounded-md border border-teal-200 bg-teal-50 px-4 py-3 text-sm text-teal-800">
              Пароль сброшен. Войдите с новым паролем.
            </p>
          ) : null}
          <LoginForm />
        </div>
      </section>
    </main>
  );
}
