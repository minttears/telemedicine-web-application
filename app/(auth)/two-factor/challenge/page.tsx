import { redirect } from "next/navigation";

import { TwoFactorChallengeForm } from "@/components/auth/two-factor-challenge-form";
import { getActiveTwoFactorChallenge } from "@/lib/auth/two-factor";

export default async function TwoFactorChallengePage() {
  const challenge = await getActiveTwoFactorChallenge();

  if (!challenge) {
    redirect("/login");
  }

  if (!challenge.user.twoFactorSecret?.enabledAt) {
    redirect("/two-factor/setup");
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-10">
      <TwoFactorChallengeForm />
    </main>
  );
}
