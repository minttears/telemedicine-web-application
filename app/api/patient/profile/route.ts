import {
  ForbiddenError,
  requireRole,
  UnauthorizedError,
} from "@/lib/auth/current-user";
import { forbidden, unauthorized } from "@/lib/auth/responses";
import { prisma } from "@/lib/prisma";

type PatientProfileUpdateBody = {
  dateOfBirth?: unknown;
  gender?: unknown;
  name?: unknown;
};

function badRequest(message: string) {
  return Response.json({ error: message }, { status: 400 });
}

function parseDateOfBirth(value: unknown) {
  if (value === undefined || value === null || value === "") {
    return null;
  }

  if (typeof value !== "string") {
    return undefined;
  }

  const date = new Date(`${value}T00:00:00.000Z`);

  if (Number.isNaN(date.getTime()) || date >= new Date()) {
    return undefined;
  }

  return date;
}

function handleAuthError(error: unknown) {
  if (error instanceof UnauthorizedError) {
    return unauthorized();
  }

  if (error instanceof ForbiddenError) {
    return forbidden();
  }

  return null;
}

export async function PATCH(request: Request) {
  try {
    const user = await requireRole("PATIENT");
    const body = (await request.json().catch(() => null)) as
      | PatientProfileUpdateBody
      | null;

    if (!body || typeof body !== "object") {
      return badRequest("Некорректные данные профиля.");
    }

    const name = typeof body.name === "string" ? body.name.trim() : "";
    const gender = typeof body.gender === "string" ? body.gender.trim() : "";
    const dateOfBirth = parseDateOfBirth(body.dateOfBirth);

    if (typeof body.name !== "string") {
      return badRequest("Некорректные данные профиля.");
    }

    if (body.gender !== undefined && typeof body.gender !== "string") {
      return badRequest("Некорректные данные профиля.");
    }

    if (name.length > 100) {
      return badRequest("Имя слишком длинное.");
    }

    if (dateOfBirth === undefined) {
      return badRequest("Укажите корректную дату рождения.");
    }

    if (gender.length > 50) {
      return badRequest("Значение поля «Пол» слишком длинное.");
    }

    const patientProfile = await prisma.patientProfile.findUnique({
      where: {
        userId: user.id,
      },
      select: {
        id: true,
      },
    });

    if (!patientProfile) {
      return badRequest("Для изменения настроек требуется профиль пациента.");
    }

    await prisma.$transaction([
      prisma.user.update({
        where: {
          id: user.id,
        },
        data: {
          name: name || null,
        },
        select: {
          id: true,
        },
      }),
      prisma.patientProfile.update({
        where: {
          id: patientProfile.id,
        },
        data: {
          dateOfBirth,
          gender: gender || null,
        },
        select: {
          id: true,
        },
      }),
    ]);

    return Response.json({ ok: true });
  } catch (error) {
    const authResponse = handleAuthError(error);

    if (authResponse) {
      return authResponse;
    }

    throw error;
  }
}
