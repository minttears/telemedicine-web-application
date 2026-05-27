import { prisma } from "@/lib/prisma";
import { verifyPassword } from "@/lib/auth/password";
import { unauthorized } from "@/lib/auth/responses";
import { createSession, setSessionCookie } from "@/lib/auth/session";
import { getRedirectPathForRole } from "@/lib/auth/current-user";

const invalidCredentialsResponse = () => unauthorized("Invalid email or password.");

function isLoginBody(value: unknown): value is {
  email: string;
  password: string;
} {
  if (!value || typeof value !== "object") {
    return false;
  }

  const body = value as Record<string, unknown>;

  return typeof body.email === "string" && typeof body.password === "string";
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);

  if (!isLoginBody(body)) {
    return invalidCredentialsResponse();
  }

  const email = body.email.trim().toLowerCase();
  const password = body.password;

  if (!email || !password) {
    return invalidCredentialsResponse();
  }

  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user || !user.isActive) {
    return invalidCredentialsResponse();
  }

  const isValidPassword = await verifyPassword(password, user.passwordHash);

  if (!isValidPassword) {
    return invalidCredentialsResponse();
  }

  const session = await createSession(user.id);
  await setSessionCookie(session.token, session.expiresAt);

  return Response.json({
    user: {
      id: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
    },
    redirectTo: getRedirectPathForRole(user.role),
  });
}
