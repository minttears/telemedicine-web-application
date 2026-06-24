import {
  ForbiddenError,
  requireRole,
  UnauthorizedError,
} from "@/lib/auth/current-user";
import { forbidden, unauthorized } from "@/lib/auth/responses";
import { prisma } from "@/lib/prisma";
import { downloadAttachmentObject } from "@/lib/supabase/storage";

type FileDownloadRouteContext = {
  params: Promise<{
    attachmentId: string;
  }>;
};

function notFound() {
  return Response.json({ error: "Файл не найден." }, { status: 404 });
}

function getContentDisposition(fileName: string) {
  const fallbackFileName =
    fileName.replace(/[^\x20-\x7E]|["\\\r\n]/g, "_") || "attachment";

  return `attachment; filename="${fallbackFileName}"; filename*=UTF-8''${encodeURIComponent(
    fileName,
  )}`;
}

export async function GET(_request: Request, context: FileDownloadRouteContext) {
  try {
    const user = await requireRole("PATIENT", "DOCTOR");
    const { attachmentId } = await context.params;

    if (!attachmentId) {
      return notFound();
    }

    const attachment = await prisma.attachment.findFirst({
      where: {
        id: attachmentId,
        consultation: {
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
      },
      select: {
        fileName: true,
        fileSize: true,
        fileType: true,
        storagePath: true,
      },
    });

    if (!attachment) {
      return notFound();
    }

    const downloadResult = await downloadAttachmentObject(
      attachment.storagePath,
    );

    if (downloadResult.error || !downloadResult.data) {
      return notFound();
    }

    return new Response(downloadResult.data, {
      headers: {
        "Content-Disposition": getContentDisposition(attachment.fileName),
        "Content-Length": String(attachment.fileSize),
        "Content-Type": attachment.fileType,
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      return unauthorized();
    }

    if (error instanceof ForbiddenError) {
      return forbidden();
    }

    return Response.json(
      { error: "Не удалось скачать файл." },
      { status: 500 },
    );
  }
}
