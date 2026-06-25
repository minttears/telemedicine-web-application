import type { ReactNode } from "react";

import { WorkspaceShell } from "@/components/workspace/workspace-shell";
import { requireWorkspaceRole } from "@/lib/auth/workspace";

const adminNavItems = [
  { href: "/admin/dashboard", label: "Панель администратора" },
  { href: "/admin/users", label: "Пользователи" },
  { href: "/admin/doctors", label: "Врачи" },
  { href: "/admin/specialties", label: "Специальности" },
  { href: "/admin/consultations", label: "Консультации" },
  { href: "/admin/audit-log", label: "Журнал аудита" },
  { href: "/admin/settings", label: "Настройки" },
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
      roleLabel="Рабочее пространство администратора"
      userEmail={user.email}
    >
      {children}
    </WorkspaceShell>
  );
}
