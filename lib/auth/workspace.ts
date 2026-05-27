import type { UserRole } from "@prisma/client";
import { redirect } from "next/navigation";

import {
  getCurrentUser,
  getRedirectPathForRole,
} from "@/lib/auth/current-user";

export async function requireWorkspaceRole(requiredRole: UserRole) {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    redirect("/login");
  }

  if (currentUser.role !== requiredRole) {
    redirect(getRedirectPathForRole(currentUser.role));
  }

  return currentUser;
}
