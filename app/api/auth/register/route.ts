import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/auth/password";
import { createSession, setSessionCookie } from "@/lib/auth/session";

const duplicateEmailMessage = "An account with this email cannot be registered.";

type RegisterBody = {
  name?: string;
  email: string;
  dateOfBirth?: string;
  gender?: string;
  password: string;
  confirmPassword: string;
};

function isRegisterBody(value: unknown): value is RegisterBody {
  if (!value || typeof value !== "object") {
    return false;
  }

  const body = value as Record<string, unknown>;

  return (
    typeof body.email === "string" &&
    typeof body.password === "string" &&
    typeof body.confirmPassword === "string" &&
    (body.name === undefined || typeof body.name === "string") &&
    (body.dateOfBirth === undefined || typeof body.dateOfBirth === "string") &&
    (body.gender === undefined || typeof body.gender === "string")
  );
}

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function parseDateOfBirth(value: string | undefined) {
  if (!value) {
    return null;
  }

  const date = new Date(`${value}T00:00:00.000Z`);

  if (Number.isNaN(date.getTime()) || date >= new Date()) {
    return undefined;
  }

  return date;
}

function isUniqueConstraintError(error: unknown) {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    error.code === "P2002"
  );
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);

  if (!isRegisterBody(body)) {
    return Response.json({ error: "Invalid registration details." }, { status: 400 });
  }

  const email = body.email.trim().toLowerCase();
  const name = body.name?.trim() || null;
  const gender = body.gender?.trim() || null;
  const dateOfBirth = parseDateOfBirth(body.dateOfBirth);

  if (!email || !isValidEmail(email)) {
    return Response.json({ error: "Enter a valid email address." }, { status: 400 });
  }

  if (email.length > 254) {
    return Response.json({ error: "Email address is too long." }, { status: 400 });
  }

  if (name && name.length > 100) {
    return Response.json({ error: "Name is too long." }, { status: 400 });
  }

  if (gender && gender.length > 50) {
    return Response.json({ error: "Gender value is too long." }, { status: 400 });
  }

  if (dateOfBirth === undefined) {
    return Response.json({ error: "Enter a valid date of birth." }, { status: 400 });
  }

  if (body.password.length < 8) {
    return Response.json(
      { error: "Password must be at least 8 characters." },
      { status: 400 },
    );
  }

  if (body.password !== body.confirmPassword) {
    return Response.json({ error: "Passwords must match." }, { status: 400 });
  }

  const passwordHash = await hashPassword(body.password);

  try {
    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        role: "PATIENT",
        name,
        isActive: true,
        patientProfile: {
          create: {
            dateOfBirth,
            gender,
          },
        },
      },
    });

    const session = await createSession(user.id);
    await setSessionCookie(session.token, session.expiresAt);

    return Response.json(
      {
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
          name: user.name,
        },
        redirectTo: "/patient/dashboard",
      },
      { status: 201 },
    );
  } catch (error) {
    if (isUniqueConstraintError(error)) {
      return Response.json({ error: duplicateEmailMessage }, { status: 409 });
    }

    throw error;
  }
}
