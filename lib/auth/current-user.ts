import type { UserRole } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import { getSessionCookie, hashSessionToken } from "@/lib/auth/session";
import {
  isTwoFactorEnforcementEnabled,
  isTwoFactorRequiredRole,
} from "@/lib/auth/two-factor";

export type SafeUser = {
  avatarStoragePath: string | null;
  createdAt: Date;
  email: string;
  id: string;
  isActive: boolean;
  name: string | null;
  passwordChangedAt: Date | null;
  phone: string | null;
  role: UserRole;
  updatedAt: Date;
};

export class UnauthorizedError extends Error {
  constructor(message = "Unauthorized") {
    super(message);
    this.name = "UnauthorizedError";
  }
}

export class ForbiddenError extends Error {
  constructor(message = "Forbidden") {
    super(message);
    this.name = "ForbiddenError";
  }
}

export async function getCurrentUser() {
  const sessionToken = await getSessionCookie();

  if (!sessionToken) {
    return null;
  }

  const session = await prisma.session.findFirst({
    where: {
      tokenHash: hashSessionToken(sessionToken),
      revokedAt: null,
      expiresAt: {
        gt: new Date(),
      },
      user: {
        isActive: true,
      },
    },
    select: {
      user: {
          select: {
          avatarStoragePath: true,
          createdAt: true,
          email: true,
          id: true,
          isActive: true,
          name: true,
          passwordChangedAt: true,
          phone: true,
          role: true,
          twoFactorSecret: {
            select: {
              enabledAt: true,
            },
          },
          updatedAt: true,
        },
      },
    },
  });

  if (!session) {
    return null;
  }

  if (
    isTwoFactorEnforcementEnabled() &&
    isTwoFactorRequiredRole(session.user.role) &&
    !session.user.twoFactorSecret?.enabledAt
  ) {
    return null;
  }

  return {
    avatarStoragePath: session.user.avatarStoragePath,
    createdAt: session.user.createdAt,
    email: session.user.email,
    id: session.user.id,
    isActive: session.user.isActive,
    name: session.user.name,
    passwordChangedAt: session.user.passwordChangedAt,
    phone: session.user.phone,
    role: session.user.role,
    updatedAt: session.user.updatedAt,
  };
}

export async function requireUser() {
  const user = await getCurrentUser();

  if (!user) {
    throw new UnauthorizedError();
  }

  return user;
}

export async function requireRole(...roles: UserRole[]) {
  const user = await requireUser();

  if (!roles.includes(user.role)) {
    throw new ForbiddenError();
  }

  return user;
}

export function getRedirectPathForRole(role: UserRole) {
  if (role === "ADMIN") {
    return "/admin/dashboard";
  }

  if (role === "DOCTOR") {
    return "/doctor/dashboard";
  }

  return "/patient/dashboard";
}
