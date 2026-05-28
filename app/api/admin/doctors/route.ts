import {
  ForbiddenError,
  requireRole,
  UnauthorizedError,
} from "@/lib/auth/current-user";
import { hashPassword } from "@/lib/auth/password";
import { forbidden, unauthorized } from "@/lib/auth/responses";
import { prisma } from "@/lib/prisma";

const duplicateEmailMessage = "A doctor account with this email cannot be created.";
const invalidSpecialtyMessage = "Select an active specialty.";
const MAX_TITLE_LENGTH = 120;
const MAX_BIO_LENGTH = 2000;
const MAX_EDUCATION_LENGTH = 1000;

type DoctorCreateBody = {
  name?: unknown;
  email?: unknown;
  temporaryPassword?: unknown;
  title?: unknown;
  specialtyId?: unknown;
  bio?: unknown;
  education?: unknown;
  experienceYears?: unknown;
  isActive?: unknown;
  isAvailable?: unknown;
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

function validateBoolean(value: unknown, fieldName: string) {
  if (typeof value !== "boolean") {
    return `${fieldName} must be selected.`;
  }

  return null;
}

function validateTextLength(value: string, maxLength: number, label: string) {
  if (value.length > maxLength) {
    return `${label} is too long.`;
  }

  return null;
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

  const body = (await request.json().catch(() => null)) as DoctorCreateBody | null;

  if (!body || typeof body !== "object") {
    return Response.json({ error: "Invalid doctor details." }, { status: 400 });
  }

  const name = typeof body.name === "string" ? body.name.trim() : "";
  const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  const temporaryPassword =
    typeof body.temporaryPassword === "string" ? body.temporaryPassword : "";
  const title = typeof body.title === "string" ? body.title.trim() : "";
  const specialtyId =
    typeof body.specialtyId === "string" ? body.specialtyId.trim() : "";
  const bio = typeof body.bio === "string" ? body.bio.trim() : "";
  const education =
    typeof body.education === "string" ? body.education.trim() : "";
  const experienceYears = parseExperienceYears(body.experienceYears);

  if (!name) {
    return Response.json({ error: "Name is required." }, { status: 400 });
  }

  if (name.length > 100) {
    return Response.json({ error: "Name is too long." }, { status: 400 });
  }

  if (!email || !isValidEmail(email)) {
    return Response.json({ error: "Enter a valid email address." }, { status: 400 });
  }

  if (email.length > 254) {
    return Response.json({ error: "Email address is too long." }, { status: 400 });
  }

  if (temporaryPassword.length < 8) {
    return Response.json(
      { error: "Temporary password must be at least 8 characters." },
      { status: 400 },
    );
  }

  if (!specialtyId) {
    return Response.json({ error: invalidSpecialtyMessage }, { status: 400 });
  }

  const titleError = validateTextLength(title, MAX_TITLE_LENGTH, "Title");
  if (titleError) {
    return Response.json({ error: titleError }, { status: 400 });
  }

  const bioError = validateTextLength(bio, MAX_BIO_LENGTH, "Bio");
  if (bioError) {
    return Response.json({ error: bioError }, { status: 400 });
  }

  const educationError = validateTextLength(
    education,
    MAX_EDUCATION_LENGTH,
    "Education",
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
      { error: "Experience years must be between 0 and 80." },
      { status: 400 },
    );
  }

  const activeError = validateBoolean(body.isActive, "Account active");
  if (activeError) {
    return Response.json({ error: activeError }, { status: 400 });
  }

  const availableError = validateBoolean(
    body.isAvailable,
    "Available for booking",
  );
  if (availableError) {
    return Response.json({ error: availableError }, { status: 400 });
  }

  const isActive = body.isActive as boolean;
  const isAvailable = body.isAvailable as boolean;

  const specialty = await prisma.specialty.findFirst({
    where: {
      id: specialtyId,
      isActive: true,
    },
    select: {
      id: true,
    },
  });

  if (!specialty) {
    return Response.json({ error: invalidSpecialtyMessage }, { status: 400 });
  }

  const passwordHash = await hashPassword(temporaryPassword);

  try {
    const doctor = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          email,
          isActive,
          name,
          passwordHash,
          role: "DOCTOR",
        },
        select: {
          id: true,
        },
      });

      const doctorProfile = await tx.doctorProfile.create({
        data: {
          bio: bio || null,
          education: education || null,
          experienceYears,
          isAvailable,
          specialtyId,
          title: title || null,
          userId: user.id,
        },
        select: {
          id: true,
        },
      });

      await tx.auditLog.create({
        data: {
          action: "DOCTOR_CREATED",
          actorId: admin.id,
          entityId: doctorProfile.id,
          entityType: "DoctorProfile",
          metadata: {
            changedFields: [
              "name",
              "email",
              "title",
              "specialtyId",
              "bio",
              "education",
              "experienceYears",
              "isActive",
              "isAvailable",
            ],
            doctorProfileId: doctorProfile.id,
            userId: user.id,
          },
        },
      });

      return doctorProfile;
    });

    return Response.json(
      {
        doctorId: doctor.id,
        redirectTo: `/admin/doctors/${doctor.id}?created=1`,
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
