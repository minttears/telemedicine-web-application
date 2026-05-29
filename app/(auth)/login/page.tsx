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
            Remote consultation platform
          </p>
          <h1 className="mt-3 text-4xl font-semibold tracking-normal text-slate-950">
            Secure telemedicine access
          </h1>
          <p className="mt-4 text-base leading-7 text-slate-600">
            Sign in to manage consultations, messages, files, schedules, and
            care history.
          </p>
        </div>

        <div>
          {passwordSet ? (
            <p className="mb-4 rounded-md border border-teal-200 bg-teal-50 px-4 py-3 text-sm text-teal-800">
              Password set. Sign in with your new password.
            </p>
          ) : null}
          {passwordReset ? (
            <p className="mb-4 rounded-md border border-teal-200 bg-teal-50 px-4 py-3 text-sm text-teal-800">
              Password reset. Sign in with your new password.
            </p>
          ) : null}
          <LoginForm />
        </div>
      </section>
    </main>
  );
}
