import type { ReactNode } from "react";

import { WorkspaceShell } from "@/components/workspace/workspace-shell";
import { requireWorkspaceRole } from "@/lib/auth/workspace";

const patientNavItems = [
  { href: "/patient/dashboard", label: "Dashboard" },
  { href: "/patient/doctors", label: "Doctors" },
  { href: "/patient/consultations", label: "Consultations" },
  { href: "/patient/files", label: "Files" },
  { href: "/patient/profile", label: "Profile" },
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
      roleLabel="Patient workspace"
      userEmail={user.email}
    >
      {children}
    </WorkspaceShell>
  );
}
