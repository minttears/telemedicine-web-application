import type { ReactNode } from "react";

import { WorkspaceShell } from "@/components/workspace/workspace-shell";
import { requireWorkspaceRole } from "@/lib/auth/workspace";

export default async function DoctorLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  const user = await requireWorkspaceRole("DOCTOR");

  return (
    <WorkspaceShell roleLabel="Doctor workspace" userEmail={user.email}>
      {children}
    </WorkspaceShell>
  );
}
