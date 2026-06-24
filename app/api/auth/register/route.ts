import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/auth/password";
import { createSession, setSessionCookie } from "@/lib/auth/session";

const duplicateEmailMessage =
  "Не удалось зарегистрировать аккаунт с этим email.";
const legalConsentVersion = "2026-05-31";

type RegisterBody = {
  name?: string;
  email: string;
  dateOfBirth?: string;
  gender?: string;
  legalConsentAccepted?: boolean;
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
    (body.legalConsentAccepted === undefined ||
      typeof body.legalConsentAccepted === "boolean") &&
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
    return Response.json(
      { error: "Некорректные регистрационные данные." },
      { status: 400 },
    );
  }

  const email = body.email.trim().toLowerCase();
  const name = body.name?.trim() || null;
  const gender = body.gender?.trim() || null;
  const dateOfBirth = parseDateOfBirth(body.dateOfBirth);

  if (!email || !isValidEmail(email)) {
    return Response.json({ error: "Введите корректный email." }, { status: 400 });
  }

  if (email.length > 254) {
    return Response.json({ error: "Email слишком длинный." }, { status: 400 });
  }

  if (name && name.length > 100) {
    return Response.json({ error: "Имя слишком длинное." }, { status: 400 });
  }

  if (gender && gender.length > 50) {
    return Response.json({ error: "Значение пола слишком длинное." }, { status: 400 });
  }

  if (dateOfBirth === undefined) {
    return Response.json(
      { error: "Введите корректную дату рождения." },
      { status: 400 },
    );
  }

  if (body.password.length < 8) {
    return Response.json(
      { error: "Пароль должен содержать не менее 8 символов." },
      { status: 400 },
    );
  }

  if (body.password !== body.confirmPassword) {
    return Response.json({ error: "Пароли должны совпадать." }, { status: 400 });
  }

  if (body.legalConsentAccepted !== true) {
    return Response.json(
      { error: "Перед регистрацией необходимо принять правовые условия." },
      { status: 400 },
    );
  }

  const passwordHash = await hashPassword(body.password);
  const acceptedAt = new Date();

  try {
    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        role: "PATIENT",
        name,
        isActive: true,
        legalConsentVersion,
        privacyAcceptedAt: acceptedAt,
        telemedicineConsentAcceptedAt: acceptedAt,
        termsAcceptedAt: acceptedAt,
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
