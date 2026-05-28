import {
  ForbiddenError,
  requireRole,
  UnauthorizedError,
} from "@/lib/auth/current-user";
import { forbidden, unauthorized } from "@/lib/auth/responses";
import { prisma } from "@/lib/prisma";

const duplicateSpecialtyMessage = "A specialty with this name or slug already exists.";
const invalidSpecialtyMessage = "Specialty not found.";
const MAX_NAME_LENGTH = 100;
const MAX_SLUG_LENGTH = 100;
const MAX_DESCRIPTION_LENGTH = 1000;

type SpecialtyUpdateBody = {
  description?: unknown;
  isActive?: unknown;
  name?: unknown;
  slug?: unknown;
};

type SpecialtyUpdateRouteContext = {
  params: Promise<{
    specialtyId: string;
  }>;
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

function validateSpecialtyBody(body: SpecialtyUpdateBody | null) {
  if (!body || typeof body !== "object") {
    return { error: "Invalid specialty details." };
  }

  const name = typeof body.name === "string" ? body.name.trim() : "";
  const slug = typeof body.slug === "string" ? body.slug.trim().toLowerCase() : "";
  const description =
    typeof body.description === "string" ? body.description.trim() : "";

  if (!name) return { error: "Name is required." };
  if (name.length > MAX_NAME_LENGTH) return { error: "Name is too long." };
  if (!slug) return { error: "Slug is required." };
  if (slug.length > MAX_SLUG_LENGTH) return { error: "Slug is too long." };
  if (!isValidSlug(slug)) {
    return {
      error:
        "Slug must use lowercase letters, numbers, and hyphens without leading or trailing hyphens.",
    };
  }
  if (description.length > MAX_DESCRIPTION_LENGTH) {
    return { error: "Description is too long." };
  }
  if (typeof body.isActive !== "boolean") {
    return { error: "Active status must be selected." };
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

function getChangedFields({
  current,
  next,
}: {
  current: {
    description: string | null;
    isActive: boolean;
    name: string;
    slug: string;
  };
  next: {
    description: string | null;
    isActive: boolean;
    name: string;
    slug: string;
  };
}) {
  const changedFields: string[] = [];

  if (current.name !== next.name) changedFields.push("name");
  if (current.slug !== next.slug) changedFields.push("slug");
  if (current.description !== next.description) {
    changedFields.push("description");
  }
  if (current.isActive !== next.isActive) changedFields.push("isActive");

  return changedFields;
}

export async function PATCH(
  request: Request,
  { params }: SpecialtyUpdateRouteContext,
) {
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

  const { specialtyId } = await params;
  const body = (await request.json().catch(() => null)) as SpecialtyUpdateBody | null;
  const validation = validateSpecialtyBody(body);

  if (!specialtyId.trim()) {
    return Response.json({ error: invalidSpecialtyMessage }, { status: 404 });
  }

  if ("error" in validation) {
    return Response.json({ error: validation.error }, { status: 400 });
  }

  const currentSpecialty = await prisma.specialty.findUnique({
    where: {
      id: specialtyId,
    },
    select: {
      description: true,
      id: true,
      isActive: true,
      name: true,
      slug: true,
    },
  });

  if (!currentSpecialty) {
    return Response.json({ error: invalidSpecialtyMessage }, { status: 404 });
  }

  const changedFields = getChangedFields({
    current: currentSpecialty,
    next: validation.data,
  });

  try {
    await prisma.$transaction(async (tx) => {
      await tx.specialty.update({
        where: {
          id: currentSpecialty.id,
        },
        data: validation.data,
      });

      if (changedFields.length > 0) {
        await tx.auditLog.create({
          data: {
            action: "SPECIALTY_UPDATED",
            actorId: admin.id,
            entityId: currentSpecialty.id,
            entityType: "Specialty",
            metadata: {
              changedFields,
              specialtyId: currentSpecialty.id,
            },
          },
        });
      }
    });

    return Response.json({
      redirectTo: `/admin/specialties/${currentSpecialty.id}?updated=1`,
      specialtyId: currentSpecialty.id,
    });
  } catch (error) {
    if (isUniqueConstraintError(error)) {
      return Response.json({ error: duplicateSpecialtyMessage }, { status: 409 });
    }

    throw error;
  }
}
