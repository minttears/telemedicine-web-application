import {
  ForbiddenError,
  requireRole,
  UnauthorizedError,
} from "@/lib/auth/current-user";
import { forbidden, unauthorized } from "@/lib/auth/responses";
import { prisma } from "@/lib/prisma";

const duplicateEmailMessage =
  "Не удалось обновить учётную запись врача с этим email.";
const invalidDoctorMessage = "Врач не найден.";
const invalidSpecialtyMessage = "Выберите активную специальность.";
const MAX_TITLE_LENGTH = 120;
const MAX_BIO_LENGTH = 2000;
const MAX_EDUCATION_LENGTH = 1000;

type DoctorUpdateBody = {
  name?: unknown;
  email?: unknown;
  title?: unknown;
  specialtyId?: unknown;
  bio?: unknown;
  education?: unknown;
  experienceYears?: unknown;
  isActive?: unknown;
  isAvailable?: unknown;
};

type DoctorUpdateRouteContext = {
  params: Promise<{
    doctorId: string;
  }>;
};

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function isUniqueConstraintError(error: unknown) {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    error.code === "P2002"
  );
}

function parseExperienceYears(value: unknown) {
  if (typeof value === "number") {
    return Number.isInteger(value) ? value : undefined;
  }

  if (typeof value === "string" && value.trim() !== "") {
    const parsed = Number(value);
    return Number.isInteger(parsed) ? parsed : undefined;
  }

  return null;
}

function validateTextLength(
  value: string,
  maxLength: number,
  errorMessage: string,
) {
  if (value.length > maxLength) {
    return errorMessage;
  }

  return null;
}

function getChangedFields({
  current,
  next,
}: {
  current: {
    bio: string | null;
    education: string | null;
    experienceYears: number | null;
    isAvailable: boolean;
    specialtyId: string | null;
    title: string | null;
    user: {
      email: string;
      isActive: boolean;
      name: string | null;
    };
  };
  next: {
    bio: string | null;
    education: string | null;
    email: string;
    experienceYears: number;
    isActive: boolean;
    isAvailable: boolean;
    name: string;
    specialtyId: string;
    title: string | null;
  };
}) {
  const changedFields: string[] = [];

  if (current.user.name !== next.name) changedFields.push("name");
  if (current.user.email !== next.email) changedFields.push("email");
  if (current.title !== next.title) changedFields.push("title");
  if (current.specialtyId !== next.specialtyId) changedFields.push("specialtyId");
  if (current.bio !== next.bio) changedFields.push("bio");
  if (current.education !== next.education) changedFields.push("education");
  if (current.experienceYears !== next.experienceYears) {
    changedFields.push("experienceYears");
  }
  if (current.user.isActive !== next.isActive) changedFields.push("isActive");
  if (current.isAvailable !== next.isAvailable) changedFields.push("isAvailable");

  return changedFields;
}

export async function PATCH(
  request: Request,
  { params }: DoctorUpdateRouteContext,
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

  const { doctorId } = await params;
  const body = (await request.json().catch(() => null)) as DoctorUpdateBody | null;

  if (!body || typeof body !== "object") {
    return Response.json({ error: "Проверьте данные врача." }, { status: 400 });
  }

  const name = typeof body.name === "string" ? body.name.trim() : "";
  const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  const title = typeof body.title === "string" ? body.title.trim() : "";
  const specialtyId =
    typeof body.specialtyId === "string" ? body.specialtyId.trim() : "";
  const bio = typeof body.bio === "string" ? body.bio.trim() : "";
  const education =
    typeof body.education === "string" ? body.education.trim() : "";
  const experienceYears = parseExperienceYears(body.experienceYears);

  if (!doctorId.trim()) {
    return Response.json({ error: invalidDoctorMessage }, { status: 404 });
  }

  if (!name) {
    return Response.json({ error: "Укажите имя врача." }, { status: 400 });
  }

  if (name.length > 100) {
    return Response.json({ error: "Имя врача слишком длинное." }, { status: 400 });
  }

  if (!email || !isValidEmail(email)) {
    return Response.json({ error: "Введите корректный email." }, { status: 400 });
  }

  if (email.length > 254) {
    return Response.json({ error: "Email слишком длинный." }, { status: 400 });
  }

  if (!specialtyId) {
    return Response.json({ error: invalidSpecialtyMessage }, { status: 400 });
  }

  const titleError = validateTextLength(
    title,
    MAX_TITLE_LENGTH,
    "Название должности слишком длинное.",
  );
  if (titleError) {
    return Response.json({ error: titleError }, { status: 400 });
  }

  const bioError = validateTextLength(
    bio,
    MAX_BIO_LENGTH,
    "Описание врача слишком длинное.",
  );
  if (bioError) {
    return Response.json({ error: bioError }, { status: 400 });
  }

  const educationError = validateTextLength(
    education,
    MAX_EDUCATION_LENGTH,
    "Сведения об образовании слишком длинные.",
  );
  if (educationError) {
    return Response.json({ error: educationError }, { status: 400 });
  }

  if (
    experienceYears === undefined ||
    experienceYears === null ||
    experienceYears < 0 ||
    experienceYears > 80
  ) {
    return Response.json(
      { error: "Стаж должен быть от 0 до 80 лет." },
      { status: 400 },
    );
  }

  if (typeof body.isActive !== "boolean") {
    return Response.json(
      { error: "Выберите статус учётной записи." },
      { status: 400 },
    );
  }

  if (typeof body.isAvailable !== "boolean") {
    return Response.json(
      { error: "Выберите доступность врача для записи." },
      { status: 400 },
    );
  }

  const isActive = body.isActive;
  const isAvailable = body.isAvailable;

  const currentDoctor = await prisma.doctorProfile.findFirst({
    where: {
      id: doctorId,
      user: {
        role: "DOCTOR",
      },
    },
    select: {
      bio: true,
      education: true,
      experienceYears: true,
      id: true,
      isAvailable: true,
      specialtyId: true,
      title: true,
      user: {
        select: {
          email: true,
          id: true,
          isActive: true,
          name: true,
        },
      },
    },
  });

  if (!currentDoctor) {
    return Response.json({ error: invalidDoctorMessage }, { status: 404 });
  }

  const specialty = await prisma.specialty.findFirst({
    where: {
      id: specialtyId,
      ...(specialtyId === currentDoctor.specialtyId
        ? {}
        : {
            isActive: true,
          }),
    },
    select: {
      id: true,
    },
  });

  if (!specialty) {
    return Response.json({ error: invalidSpecialtyMessage }, { status: 400 });
  }

  const nextValues = {
    bio: bio || null,
    education: education || null,
    email,
    experienceYears,
    isActive,
    isAvailable,
    name,
    specialtyId,
    title: title || null,
  };
  const changedFields = getChangedFields({
    current: currentDoctor,
    next: nextValues,
  });

  try {
    await prisma.$transaction(async (tx) => {
      await tx.user.update({
        where: {
          id: currentDoctor.user.id,
        },
        data: {
          email,
          isActive,
          name,
        },
      });

      await tx.doctorProfile.update({
        where: {
          id: currentDoctor.id,
        },
        data: {
          bio: nextValues.bio,
          education: nextValues.education,
          experienceYears,
          isAvailable,
          specialtyId,
          title: nextValues.title,
        },
      });

      if (changedFields.length > 0) {
        await tx.auditLog.create({
          data: {
            action: changedFields.includes("isActive") && !isActive
              ? "USER_DEACTIVATED"
              : "DOCTOR_UPDATED",
            actorId: admin.id,
            entityId: currentDoctor.id,
            entityType: "DoctorProfile",
            metadata: {
              changedFields,
              doctorProfileId: currentDoctor.id,
              userId: currentDoctor.user.id,
            },
          },
        });
      }
    });

    return Response.json({
      doctorId: currentDoctor.id,
      redirectTo: `/admin/doctors/${currentDoctor.id}?updated=1`,
    });
  } catch (error) {
    if (isUniqueConstraintError(error)) {
      return Response.json({ error: duplicateEmailMessage }, { status: 409 });
    }

    throw error;
  }
}
