import { redirect } from "next/navigation";

import { LoginForm } from "@/components/auth/login-form";
import { getCurrentUser, getRedirectPathForRole } from "@/lib/auth/current-user";

const developmentEmails =
  process.env.NODE_ENV === "production"
    ? []
    : ["admin@example.local", "doctor@example.local", "patient@example.local"];

export default async function LoginPage() {
  const currentUser = await getCurrentUser();

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
            Access care workflows from one secure workspace
          </h1>
          <p className="mt-4 text-base leading-7 text-slate-600">
            Patients, doctors, and administrators use the same sign-in flow.
            Your role determines the workspace you see after authentication.
          </p>
          <div className="mt-8 grid gap-3 text-sm text-slate-700 sm:grid-cols-3">
            <div className="rounded-lg border border-slate-200 bg-white p-4">
              Patient workspace
            </div>
            <div className="rounded-lg border border-slate-200 bg-white p-4">
              Doctor workspace
            </div>
            <div className="rounded-lg border border-slate-200 bg-white p-4">
              Admin workspace
            </div>
          </div>
        </div>

        <LoginForm developmentEmails={developmentEmails} />
      </section>
    </main>
  );
}
