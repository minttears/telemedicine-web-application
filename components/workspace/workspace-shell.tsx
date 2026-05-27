import type { ReactNode } from "react";

import { LogoutButton } from "@/components/auth/logout-button";

type WorkspaceShellProps = {
  children: ReactNode;
  roleLabel: string;
  userEmail: string;
};

export function WorkspaceShell({
  children,
  roleLabel,
  userEmail,
}: WorkspaceShellProps) {
  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
          <div>
            <p className="text-sm font-medium text-teal-700">{roleLabel}</p>
            <p className="mt-1 text-sm text-slate-600">{userEmail}</p>
          </div>
          <LogoutButton />
        </div>
      </header>
      <div className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6">
        {children}
      </div>
    </div>
  );
}
