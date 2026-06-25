import type { ReactNode } from "react";

import { WorkspaceShell } from "@/components/workspace/workspace-shell";
import { requireWorkspaceRole } from "@/lib/auth/workspace";

const doctorNavItems = [
  { href: "/doctor/dashboard", label: "Главная" },
  { href: "/doctor/schedule", label: "Расписание" },
  { href: "/doctor/consultations", label: "Консультации" },
  { href: "/doctor/files", label: "Файлы" },
  { href: "/doctor/patients", label: "Пациенты" },
  { href: "/doctor/profile", label: "Профиль" },
  { href: "/doctor/security", label: "Безопасность" },
];

export default async function DoctorLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  const user = await requireWorkspaceRole("DOCTOR");

  return (
    <WorkspaceShell
      navItems={doctorNavItems}
      roleLabel="Кабинет врача"
      userEmail={user.email}
    >
      {children}
    </WorkspaceShell>
  );
}
