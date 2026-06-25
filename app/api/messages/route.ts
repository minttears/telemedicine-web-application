import { MessageType } from "@prisma/client";
import type { NextRequest } from "next/server";

import {
  ForbiddenError,
  requireRole,
  UnauthorizedError,
} from "@/lib/auth/current-user";
import { forbidden, unauthorized } from "@/lib/auth/responses";
import { prisma } from "@/lib/prisma";

const MAX_MESSAGE_LENGTH = 2000;

export function GET() {
  return Response.json(
    {
      error:
        "GET /api/messages не поддерживается. Просматривайте сообщения на доступных вам страницах консультаций.",
    },
    {
      headers: {
        Allow: "POST",
      },
      status: 405,
    },
  );
}

function badRequest(message: string) {
  return Response.json({ error: message }, { status: 400 });
}

function notFound() {
  return Response.json({ error: "Консультация не найдена." }, { status: 404 });
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireRole("PATIENT", "DOCTOR");

    let payload: unknown;

    try {
      payload = await request.json();
    } catch {
      return badRequest("Некорректные данные запроса.");
    }

    if (!payload || typeof payload !== "object") {
      return badRequest("Некорректные данные запроса.");
    }

    const { consultationId, body } = payload as {
      body?: unknown;
      consultationId?: unknown;
    };

    if (typeof consultationId !== "string" || consultationId.trim() === "") {
      return badRequest("Укажите консультацию.");
    }

    if (typeof body !== "string") {
      return badRequest("Введите текст сообщения.");
    }

    const trimmedBody = body.trim();

    if (trimmedBody.length === 0) {
      return badRequest("Введите текст сообщения.");
    }

    if (trimmedBody.length > MAX_MESSAGE_LENGTH) {
      return badRequest(
        `Текст сообщения должен содержать не более ${MAX_MESSAGE_LENGTH} символов.`,
      );
    }

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

    if (consultation.status === "COMPLETED") {
      return Response.json(
        { error: "Чат завершённой консультации доступен только для чтения." },
        { status: 409 },
      );
    }

    const message = await prisma.message.create({
      data: {
        body: trimmedBody,
        consultationId: consultation.id,
        senderId: user.id,
        type: MessageType.TEXT,
      },
      select: {
        id: true,
      },
    });

    return Response.json({ id: message.id });
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      return unauthorized();
    }

    if (error instanceof ForbiddenError) {
      return forbidden();
    }

    return Response.json(
      { error: "Не удалось отправить сообщение." },
      { status: 500 },
    );
  }
}
