import type { ReactNode } from "react";

import { WorkspaceShell } from "@/components/workspace/workspace-shell";
import { requireWorkspaceRole } from "@/lib/auth/workspace";

const adminNavItems = [
  { href: "/admin/dashboard", label: "Dashboard" },
  { href: "/admin/users", label: "Users" },
  { href: "/admin/doctors", label: "Doctors" },
  { href: "/admin/specialties", label: "Specialties" },
  { href: "/admin/consultations", label: "Consultations" },
  { href: "/admin/audit-log", label: "Audit Log" },
  { href: "/admin/settings", label: "Settings" },
];

export default async function AdminLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  const user = await requireWorkspaceRole("ADMIN");

  return (
    <WorkspaceShell
      navItems={adminNavItems}
      roleLabel="Admin workspace"
      userEmail={user.email}
    >
      {children}
    </WorkspaceShell>
  );
}
