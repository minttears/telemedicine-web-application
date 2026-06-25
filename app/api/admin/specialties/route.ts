import {
  ForbiddenError,
  requireRole,
  UnauthorizedError,
} from "@/lib/auth/current-user";
import { forbidden, unauthorized } from "@/lib/auth/responses";
import { prisma } from "@/lib/prisma";

const duplicateSpecialtyMessage =
  "Специальность с таким названием или slug уже существует.";
const MAX_NAME_LENGTH = 100;
const MAX_SLUG_LENGTH = 100;
const MAX_DESCRIPTION_LENGTH = 1000;

type SpecialtyCreateBody = {
  description?: unknown;
  isActive?: unknown;
  name?: unknown;
  slug?: unknown;
};

function isUniqueConstraintError(error: unknown) {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    error.code === "P2002"
  );
}

function isValidSlug(value: string) {
  return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value);
}

function validateSpecialtyBody(body: SpecialtyCreateBody | null) {
  if (!body || typeof body !== "object") {
    return { error: "Проверьте данные специальности." };
  }

  const name = typeof body.name === "string" ? body.name.trim() : "";
  const slug = typeof body.slug === "string" ? body.slug.trim().toLowerCase() : "";
  const description =
    typeof body.description === "string" ? body.description.trim() : "";

  if (!name) return { error: "Укажите название специальности." };
  if (name.length > MAX_NAME_LENGTH) {
    return { error: "Название специальности слишком длинное." };
  }
  if (!slug) return { error: "Укажите slug." };
  if (slug.length > MAX_SLUG_LENGTH) return { error: "Slug слишком длинный." };
  if (!isValidSlug(slug)) {
    return {
      error:
        "Slug может содержать строчные латинские буквы, цифры и дефисы без дефиса в начале или конце.",
    };
  }
  if (description.length > MAX_DESCRIPTION_LENGTH) {
    return { error: "Описание слишком длинное." };
  }
  if (typeof body.isActive !== "boolean") {
    return { error: "Выберите статус специальности." };
  }

  return {
    data: {
      description: description || null,
      isActive: body.isActive,
      name,
      slug,
    },
  };
}

export async function POST(request: Request) {
  let admin;

  try {
    admin = await requireRole("ADMIN");
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      return unauthorized();
    }

    if (error instanceof ForbiddenError) {
      return forbidden();
    }

    throw error;
  }

  const body = (await request.json().catch(() => null)) as SpecialtyCreateBody | null;
  const validation = validateSpecialtyBody(body);

  if ("error" in validation) {
    return Response.json({ error: validation.error }, { status: 400 });
  }

  try {
    const specialty = await prisma.$transaction(async (tx) => {
      const created = await tx.specialty.create({
        data: validation.data,
        select: {
          id: true,
        },
      });

      await tx.auditLog.create({
        data: {
          action: "SPECIALTY_CREATED",
          actorId: admin.id,
          entityId: created.id,
          entityType: "Specialty",
          metadata: {
            changedFields: ["name", "slug", "description", "isActive"],
            specialtyId: created.id,
          },
        },
      });

      return created;
    });

    return Response.json(
      {
        redirectTo: `/admin/specialties/${specialty.id}?created=1`,
        specialtyId: specialty.id,
      },
      { status: 201 },
    );
  } catch (error) {
    if (isUniqueConstraintError(error)) {
      return Response.json({ error: duplicateSpecialtyMessage }, { status: 409 });
    }

    throw error;
  }
}
