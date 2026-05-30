import { redirect } from "next/navigation";

import { ForgotPasswordForm } from "@/components/auth/forgot-password-form";
import { getCurrentUser, getRedirectPathForRole } from "@/lib/auth/current-user";

export default async function ForgotPasswordPage() {
  const currentUser = await getCurrentUser();

  if (currentUser) {
    redirect(getRedirectPathForRole(currentUser.role));
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-10">
      <section className="grid w-full max-w-5xl gap-8 lg:grid-cols-[1fr_440px] lg:items-center">
        <div className="max-w-xl">
          <p className="text-sm font-medium text-teal-700">
            Account recovery
          </p>
          <h1 className="mt-3 text-4xl font-semibold tracking-normal text-slate-950">
            Reset access securely
          </h1>
          <p className="mt-4 text-base leading-7 text-slate-600">
            Enter your account email and, if it is eligible for password reset,
            instructions will be sent by email.
          </p>
        </div>

        <ForgotPasswordForm />
      </section>
    </main>
  );
}
