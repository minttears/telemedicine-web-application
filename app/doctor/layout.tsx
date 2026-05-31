import type { ReactNode } from "react";

import { WorkspaceShell } from "@/components/workspace/workspace-shell";
import { requireWorkspaceRole } from "@/lib/auth/workspace";

const doctorNavItems = [
  { href: "/doctor/dashboard", label: "Dashboard" },
  { href: "/doctor/schedule", label: "Schedule" },
  { href: "/doctor/consultations", label: "Consultations" },
  { href: "/doctor/files", label: "Files" },
  { href: "/doctor/patients", label: "Patients" },
  { href: "/doctor/profile", label: "Profile" },
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
      roleLabel="Doctor workspace"
      userEmail={user.email}
    >
      {children}
    </WorkspaceShell>
  );
}
