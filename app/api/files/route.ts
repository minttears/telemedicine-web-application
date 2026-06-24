import { AuditAction, ConsultationStatus, MessageType } from "@prisma/client";
import { randomUUID } from "node:crypto";
import type { NextRequest } from "next/server";

import {
  ForbiddenError,
  requireRole,
  UnauthorizedError,
} from "@/lib/auth/current-user";
import { forbidden, unauthorized } from "@/lib/auth/responses";
import { validateAttachmentFile } from "@/lib/attachments/validation";
import { prisma } from "@/lib/prisma";
import {
  removeAttachmentObject,
  uploadAttachmentObject,
} from "@/lib/supabase/storage";

const WRITABLE_CONSULTATION_STATUSES: ConsultationStatus[] = [
  ConsultationStatus.REQUESTED,
  ConsultationStatus.SCHEDULED,
  ConsultationStatus.IN_PROGRESS,
];

function badRequest(message: string) {
  return Response.json({ error: message }, { status: 400 });
}

function notFound() {
  return Response.json({ error: "Консультация не найдена." }, { status: 404 });
}

function isFile(value: FormDataEntryValue | null): value is File {
  return (
    typeof File !== "undefined" &&
    value instanceof File &&
    typeof value.name === "string" &&
    typeof value.arrayBuffer === "function"
  );
}

function createStoragePath({
  attachmentId,
  consultationId,
  extension,
}: {
  attachmentId: string;
  consultationId: string;
  extension: string;
}) {
  return `consultations/${consultationId}/${attachmentId}/file.${extension}`;
}

export async function POST(request: NextRequest) {
  let uploadedStoragePath: string | null = null;

  try {
    const user = await requireRole("PATIENT", "DOCTOR");

    let formData: FormData;

    try {
      formData = await request.formData();
    } catch {
      return badRequest("Некорректные данные формы.");
    }

    const consultationId = formData.get("consultationId");
    const file = formData.get("file");

    if (typeof consultationId !== "string" || consultationId.trim() === "") {
      return badRequest("Укажите консультацию.");
    }

    if (!isFile(file)) {
      return badRequest("Выберите файл.");
    }

    const validation = validateAttachmentFile(file);

    if (validation.error || !validation.value) {
      return badRequest(validation.error ?? "Некорректный файл.");
    }

    const validatedFile = validation.value;

    const consultation = await prisma.consultation.findFirst({
      where: {
        id: consultationId,
        ...(user.role === "PATIENT"
          ? {
              patient: {
                userId: user.id,
              },
            }
          : {
              doctor: {
                userId: user.id,
              },
            }),
      },
      select: {
        id: true,
        status: true,
      },
    });

    if (!consultation) {
      return notFound();
    }

    if (!WRITABLE_CONSULTATION_STATUSES.includes(consultation.status)) {
      return Response.json(
        { error: "Эта консультация доступна только для чтения." },
        { status: 409 },
      );
    }

    const attachmentId = randomUUID();
    const storagePath = createStoragePath({
      attachmentId,
      consultationId: consultation.id,
      extension: validatedFile.extension,
    });
    const fileBody = await file.arrayBuffer();

    const uploadResult = await uploadAttachmentObject({
      body: fileBody,
      contentType: validatedFile.fileType,
      storagePath,
    });

    if (uploadResult.error) {
      return Response.json(
        { error: "Не удалось отправить файл." },
        { status: 500 },
      );
    }

    uploadedStoragePath = storagePath;

    const result = await prisma.$transaction(async (tx) => {
      const message = await tx.message.create({
        data: {
          body: validatedFile.displayFileName,
          consultationId: consultation.id,
          senderId: user.id,
          type: MessageType.FILE,
        },
        select: {
          id: true,
        },
      });

      const attachment = await tx.attachment.create({
        data: {
          id: attachmentId,
          consultationId: consultation.id,
          fileName: validatedFile.displayFileName,
          fileSize: validatedFile.fileSize,
          fileType: validatedFile.fileType,
          messageId: message.id,
          storagePath,
          uploadedById: user.id,
        },
        select: {
          id: true,
        },
      });

      await tx.auditLog.create({
        data: {
          action: AuditAction.FILE_UPLOADED,
          actorId: user.id,
          entityId: attachment.id,
          entityType: "Attachment",
          metadata: {
            consultationId: consultation.id,
            fileSize: validatedFile.fileSize,
            fileType: validatedFile.fileType,
          },
        },
      });

      return {
        attachmentId: attachment.id,
        messageId: message.id,
      };
    });

    uploadedStoragePath = null;

    return Response.json(result);
  } catch (error) {
    if (uploadedStoragePath) {
      await removeAttachmentObject(uploadedStoragePath).catch(() => null);
    }

    if (error instanceof UnauthorizedError) {
      return unauthorized();
    }

    if (error instanceof ForbiddenError) {
      return forbidden();
    }

    return Response.json(
      { error: "Не удалось отправить файл." },
      { status: 500 },
    );
  }
}
