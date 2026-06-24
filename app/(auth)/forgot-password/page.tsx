import { redirect } from "next/navigation";

import { ForgotPasswordForm } from "@/components/auth/forgot-password-form";
import { getCurrentUser, getRedirectPathForRole } from "@/lib/auth/current-user";

type ForgotPasswordPageProps = {
  searchParams: Promise<{
    email?: string;
  }>;
};

export default async function ForgotPasswordPage({
  searchParams,
}: ForgotPasswordPageProps) {
  const [currentUser, { email }] = await Promise.all([
    getCurrentUser(),
    searchParams,
  ]);

  if (currentUser) {
    redirect(getRedirectPathForRole(currentUser.role));
  }

  const recoveryEmail = typeof email === "string" ? email.trim().toLowerCase() : "";

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-10">
      <section className="grid w-full max-w-5xl gap-8 lg:grid-cols-[1fr_440px] lg:items-center">
        <div className="max-w-xl">
          <p className="text-sm font-medium text-teal-700">
            Восстановление доступа
          </p>
          <h1 className="mt-3 text-4xl font-semibold tracking-normal text-slate-950">
            Безопасно восстановите доступ
          </h1>
          <p className="mt-4 text-base leading-7 text-slate-600">
            Подтвердите email аккаунта, указанный на странице входа. Инструкции
            отправляются только на email соответствующего аккаунта, если для
            него доступно восстановление.
          </p>
        </div>

        <ForgotPasswordForm email={recoveryEmail} />
      </section>
    </main>
  );
}
