import { redirect } from "next/navigation";

import { RegisterForm } from "@/components/auth/register-form";
import { getCurrentUser, getRedirectPathForRole } from "@/lib/auth/current-user";

export default async function RegisterPage() {
  const currentUser = await getCurrentUser();

  if (currentUser) {
    redirect(getRedirectPathForRole(currentUser.role));
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-10">
      <section className="grid w-full max-w-5xl gap-8 lg:grid-cols-[1fr_440px] lg:items-center">
        <div className="max-w-xl">
          <p className="text-sm font-medium text-teal-700">
            Patient onboarding
          </p>
          <h1 className="mt-3 text-4xl font-semibold tracking-normal text-slate-950">
            Start with a secure patient account
          </h1>
          <p className="mt-4 text-base leading-7 text-slate-600">
            Create a patient account to access your protected workspace. Doctor
            and admin accounts are managed separately.
          </p>
          <p className="mt-6 text-sm leading-6 text-slate-500">
            Review the{" "}
            <a className="font-medium text-teal-700 hover:text-teal-800" href="/terms">
              Terms
            </a>
            ,{" "}
            <a className="font-medium text-teal-700 hover:text-teal-800" href="/privacy">
              Privacy Policy
            </a>
            , and{" "}
            <a
              className="font-medium text-teal-700 hover:text-teal-800"
              href="/telemedicine-consent"
            >
              Telemedicine Consent
            </a>
            before registering.
          </p>
        </div>

        <RegisterForm />
      </section>
    </main>
  );
}
