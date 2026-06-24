import type { ReactNode } from "react";
import Link from "next/link";

import { LogoutButton } from "@/components/auth/logout-button";

export type WorkspaceNavItem = {
  href: string;
  label: string;
};

type WorkspaceShellProps = {
  children: ReactNode;
  navItems: WorkspaceNavItem[];
  roleLabel: string;
  userEmail: string;
};

export function WorkspaceShell({
  children,
  navItems,
  roleLabel,
  userEmail,
}: WorkspaceShellProps) {
  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-4 px-4 py-4 sm:px-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-teal-700">{roleLabel}</p>
              <p className="mt-1 break-all text-sm text-slate-600">
                {userEmail}
              </p>
            </div>
            <LogoutButton />
          </div>
          <nav aria-label={`Навигация: ${roleLabel}`}>
            <ul className="flex flex-wrap gap-2">
              {navItems.map((item) => (
                <li key={item.href}>
                  <Link
                    className="inline-flex min-h-10 items-center rounded-md border border-slate-200 bg-slate-50 px-3 text-sm font-medium text-slate-700 transition hover:border-teal-600 hover:bg-white hover:text-teal-700"
                    href={item.href}
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </header>
      <main className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6">
        {children}
      </main>
    </div>
  );
}
