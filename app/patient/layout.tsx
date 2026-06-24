import type { ReactNode } from "react";

import { WorkspaceShell } from "@/components/workspace/workspace-shell";
import { requireWorkspaceRole } from "@/lib/auth/workspace";

const patientNavItems = [
  { href: "/patient/dashboard", label: "Главная" },
  { href: "/patient/doctors", label: "Врачи" },
  { href: "/patient/consultations", label: "Консультации" },
  { href: "/patient/files", label: "Файлы" },
  { href: "/patient/profile", label: "Профиль" },
];

export default async function PatientLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  const user = await requireWorkspaceRole("PATIENT");

  return (
    <WorkspaceShell
      navItems={patientNavItems}
      roleLabel="Кабинет пациента"
      userEmail={user.email}
    >
      {children}
    </WorkspaceShell>
  );
}
