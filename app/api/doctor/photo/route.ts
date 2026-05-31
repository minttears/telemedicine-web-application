import { randomUUID } from "node:crypto";

import {
  ForbiddenError,
  requireRole,
  UnauthorizedError,
} from "@/lib/auth/current-user";
import { forbidden, unauthorized } from "@/lib/auth/responses";
import { prisma } from "@/lib/prisma";
import { validateProfileImageFile } from "@/lib/profile-images/validation";
import {
  removeProfileImageObject,
  uploadProfileImageObject,
} from "@/lib/supabase/storage";

function badRequest(message: string) {
  return Response.json({ error: message }, { status: 400 });
}

function isFile(value: FormDataEntryValue | null): value is File {
  return (
    typeof File !== "undefined" &&
    value instanceof File &&
    typeof value.name === "string" &&
    typeof value.arrayBuffer === "function"
  );
}

export async function POST(request: Request) {
  let uploadedStoragePath: string | null = null;

  try {
    const user = await requireRole("DOCTOR");
    const doctorProfile = await prisma.doctorProfile.findUnique({
      where: { userId: user.id },
      select: { id: true, photoStoragePath: true },
    });

    if (!doctorProfile) {
      return badRequest("Doctor profile is required before uploading a photo.");
    }

    const formData = await request.formData().catch(() => null);

    if (!formData) {
      return badRequest("Invalid form data.");
    }

    const file = formData.get("image");

    if (!isFile(file)) {
      return badRequest("Image is required.");
    }

    const validation = validateProfileImageFile(file);

    if (validation.error || !validation.value) {
      return badRequest(validation.error ?? "Invalid image.");
    }

    const storagePath = `doctors/${doctorProfile.id}/${randomUUID()}.${validation.value.extension}`;
    const body = await file.arrayBuffer();
    const uploadResult = await uploadProfileImageObject({
      body,
      contentType: validation.value.fileType,
      storagePath,
    });

    if (uploadResult.error) {
      return Response.json({ error: "Unable to upload image." }, { status: 500 });
    }

    uploadedStoragePath = storagePath;

    const updatedProfile = await prisma.doctorProfile.update({
      where: { id: doctorProfile.id },
      data: { photoStoragePath: storagePath },
      select: { photoStoragePath: true },
    });

    uploadedStoragePath = null;

    if (
      doctorProfile.photoStoragePath &&
      doctorProfile.photoStoragePath !== updatedProfile.photoStoragePath
    ) {
      await removeProfileImageObject(doctorProfile.photoStoragePath).catch(() => null);
    }

    return Response.json({ ok: true });
  } catch (error) {
    if (uploadedStoragePath) {
      await removeProfileImageObject(uploadedStoragePath).catch(() => null);
    }

    if (error instanceof UnauthorizedError) {
      return unauthorized();
    }

    if (error instanceof ForbiddenError) {
      return forbidden();
    }

    return Response.json({ error: "Unable to upload image." }, { status: 500 });
  }
}
