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
    const user = await requireRole("PATIENT");
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

    const storagePath = `patients/${user.id}/${randomUUID()}.${validation.value.extension}`;
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

    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: { avatarStoragePath: storagePath },
      select: { avatarStoragePath: true },
    });

    uploadedStoragePath = null;

    if (user.avatarStoragePath && user.avatarStoragePath !== updatedUser.avatarStoragePath) {
      await removeProfileImageObject(user.avatarStoragePath).catch(() => null);
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
