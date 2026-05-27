import type { ReactNode } from "react";

import { WorkspaceShell } from "@/components/workspace/workspace-shell";
import { requireWorkspaceRole } from "@/lib/auth/workspace";

export default async function AdminLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  const user = await requireWorkspaceRole("ADMIN");

  return (
    <WorkspaceShell roleLabel="Admin workspace" userEmail={user.email}>
      {children}
    </WorkspaceShell>
  );
}
