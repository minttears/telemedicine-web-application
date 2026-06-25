import {
  ForbiddenError,
  requireRole,
  UnauthorizedError,
} from "@/lib/auth/current-user";
import { forbidden, unauthorized } from "@/lib/auth/responses";
import { prisma } from "@/lib/prisma";

const MAX_TITLE_LENGTH = 120;
const MAX_BIO_LENGTH = 2000;
const MAX_EDUCATION_LENGTH = 1000;

type DoctorProfileUpdateBody = {
  bio?: unknown;
  education?: unknown;
  title?: unknown;
};

function badRequest(message: string) {
  return Response.json({ error: message }, { status: 400 });
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

function validateTextLength(value: string, maxLength: number, label: string) {
  if (value.length > maxLength) {
    return `${label}: превышена допустимая длина.`;
  }

  return null;
}

export async function PATCH(request: Request) {
  try {
    const user = await requireRole("DOCTOR");
    const body = (await request.json().catch(() => null)) as
      | DoctorProfileUpdateBody
      | null;

    if (!body || typeof body !== "object") {
      return badRequest("Некорректные данные профиля.");
    }

    if (
      typeof body.title !== "string" ||
      typeof body.bio !== "string" ||
      typeof body.education !== "string"
    ) {
      return badRequest("Некорректные данные профиля.");
    }

    const title = body.title.trim();
    const bio = body.bio.trim();
    const education = body.education.trim();

    const titleError = validateTextLength(
      title,
      MAX_TITLE_LENGTH,
      "Профессиональный заголовок",
    );
    if (titleError) {
      return badRequest(titleError);
    }

    const bioError = validateTextLength(
      bio,
      MAX_BIO_LENGTH,
      "Описание профиля",
    );
    if (bioError) {
      return badRequest(bioError);
    }

    const educationError = validateTextLength(
      education,
      MAX_EDUCATION_LENGTH,
      "Образование",
    );
    if (educationError) {
      return badRequest(educationError);
    }

    const doctorProfile = await prisma.doctorProfile.findUnique({
      where: {
        userId: user.id,
      },
      select: {
        id: true,
      },
    });

    if (!doctorProfile) {
      return badRequest("Для изменения настроек требуется профиль врача.");
    }

    await prisma.doctorProfile.update({
      where: {
        id: doctorProfile.id,
      },
      data: {
        bio: bio || null,
        education: education || null,
        title: title || null,
      },
      select: {
        id: true,
      },
    });

    return Response.json({ ok: true });
  } catch (error) {
    const authResponse = handleAuthError(error);

    if (authResponse) {
      return authResponse;
    }

    throw error;
  }
}
