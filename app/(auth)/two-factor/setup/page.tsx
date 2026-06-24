import { redirect } from "next/navigation";

import { TwoFactorSetupForm } from "@/components/auth/two-factor-setup-form";
import { getActiveTwoFactorChallenge } from "@/lib/auth/two-factor";

export default async function TwoFactorSetupPage() {
  const challenge = await getActiveTwoFactorChallenge();

  if (!challenge) {
    redirect("/login");
  }

  if (challenge.user.twoFactorSecret?.enabledAt) {
    redirect("/two-factor/challenge");
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-10">
      <TwoFactorSetupForm />
    </main>
  );
}
