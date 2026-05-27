import type { User, UserRole } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import { getSessionCookie, hashSessionToken } from "@/lib/auth/session";

export type SafeUser = Omit<User, "passwordHash">;

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

function toSafeUser(user: User): SafeUser {
  return {
    id: user.id,
    email: user.email,
    role: user.role,
    name: user.name,
    phone: user.phone,
    isActive: user.isActive,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
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
    include: {
      user: true,
    },
  });

  if (!session) {
    return null;
  }

  return toSafeUser(session.user);
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
