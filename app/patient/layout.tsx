import type { ReactNode } from "react";

import { WorkspaceShell } from "@/components/workspace/workspace-shell";
import { requireWorkspaceRole } from "@/lib/auth/workspace";

export default async function PatientLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  const user = await requireWorkspaceRole("PATIENT");

  return (
    <WorkspaceShell roleLabel="Patient workspace" userEmail={user.email}>
      {children}
    </WorkspaceShell>
  );
}
