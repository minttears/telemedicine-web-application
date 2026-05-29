import { redirect } from "next/navigation";

import { ResetPasswordForm } from "@/components/auth/reset-password-form";
import { getCurrentUser, getRedirectPathForRole } from "@/lib/auth/current-user";

type ResetPasswordPageProps = {
  searchParams: Promise<{
    token?: string;
  }>;
};

export default async function ResetPasswordPage({
  searchParams,
}: ResetPasswordPageProps) {
  const [currentUser, { token }] = await Promise.all([
    getCurrentUser(),
    searchParams,
  ]);

  if (currentUser) {
    redirect(getRedirectPathForRole(currentUser.role));
  }

  const normalizedToken = token?.trim() ?? "";

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-10">
      {normalizedToken ? (
        <ResetPasswordForm token={normalizedToken} />
      ) : (
        <section className="w-full max-w-md rounded-lg border border-slate-200 bg-white p-6 text-center shadow-sm">
          <p className="text-sm font-medium text-teal-700">
            Doctor password reset
          </p>
          <h1 className="mt-3 text-2xl font-semibold tracking-normal text-slate-950">
            Reset link unavailable
          </h1>
          <p className="mt-3 text-sm leading-6 text-slate-600">
            This password reset link is invalid or expired. Contact an
            administrator for a new reset link.
          </p>
        </section>
      )}
    </main>
  );
}
