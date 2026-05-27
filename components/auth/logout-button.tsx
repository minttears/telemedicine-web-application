"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function LogoutButton() {
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);

  async function handleLogout() {
    if (isPending) {
      return;
    }

    setIsPending(true);

    try {
      await fetch("/api/auth/logout", {
        method: "POST",
      });
    } finally {
      router.replace("/login");
    }
  }

  return (
    <button
      className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition hover:border-teal-600 hover:text-teal-700 disabled:cursor-not-allowed disabled:opacity-60"
      disabled={isPending}
      onClick={handleLogout}
      type="button"
    >
      {isPending ? "Signing out..." : "Sign out"}
    </button>
  );
}
