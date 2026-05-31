import type { NextRequest } from "next/server";
import { Prisma } from "@prisma/client";

import {
  ForbiddenError,
  requireRole,
  UnauthorizedError,
} from "@/lib/auth/current-user";
import { forbidden, unauthorized } from "@/lib/auth/responses";
import { prisma } from "@/lib/prisma";

const MAX_REVIEW_COMMENT_LENGTH = 1000;

type ReviewRouteContext = {
  params: Promise<{
    consultationId: string;
  }>;
};

function badRequest(message: string) {
  return Response.json({ error: message }, { status: 400 });
}

function conflict(message: string) {
  return Response.json({ error: message }, { status: 409 });
}

function notFound() {
  return Response.json({ error: "Consultation not found." }, { status: 404 });
}

export async function POST(request: NextRequest, context: ReviewRouteContext) {
  try {
    const user = await requireRole("PATIENT");
    const { consultationId } = await context.params;

    if (consultationId.trim() === "") {
      return notFound();
    }

    let payload: unknown;

    try {
      payload = await request.json();
    } catch {
      return badRequest("Invalid request body.");
    }

    if (!payload || typeof payload !== "object") {
      return badRequest("Invalid request body.");
    }

    const { comment, rating } = payload as {
      comment?: unknown;
      rating?: unknown;
    };

    if (
      typeof rating !== "number" ||
      !Number.isInteger(rating) ||
      rating < 1 ||
      rating > 5
    ) {
      return badRequest("Rating must be an integer from 1 to 5.");
    }

    if (comment !== undefined && comment !== null && typeof comment !== "string") {
      return badRequest("Review comment must be text.");
    }

    const trimmedComment = typeof comment === "string" ? comment.trim() : "";

    if (trimmedComment.length > MAX_REVIEW_COMMENT_LENGTH) {
      return badRequest(
        `Review comment must be ${MAX_REVIEW_COMMENT_LENGTH} characters or fewer.`,
      );
    }

    const consultation = await prisma.consultation.findFirst({
      where: {
        id: consultationId,
        patient: {
          userId: user.id,
        },
      },
      select: {
        doctorId: true,
        doctorReview: {
          select: {
            id: true,
          },
        },
        id: true,
        patientId: true,
        status: true,
      },
    });

    if (!consultation) {
      return notFound();
    }

    if (consultation.status !== "COMPLETED") {
      return conflict("Only completed consultations can be reviewed.");
    }

    if (consultation.doctorReview) {
      return conflict("This consultation already has a review.");
    }

    try {
      const review = await prisma.doctorReview.create({
        data: {
          comment: trimmedComment.length > 0 ? trimmedComment : null,
          consultationId: consultation.id,
          doctorProfileId: consultation.doctorId,
          patientProfileId: consultation.patientId,
          rating,
        },
        select: {
          comment: true,
          createdAt: true,
          id: true,
          rating: true,
        },
      });

      return Response.json({
        review: {
          ...review,
          createdAt: review.createdAt.toISOString(),
        },
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === "P2002"
      ) {
        return conflict("This consultation already has a review.");
      }

      throw error;
    }
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      return unauthorized();
    }

    if (error instanceof ForbiddenError) {
      return forbidden();
    }

    return Response.json({ error: "Unable to submit review." }, { status: 500 });
  }
}
