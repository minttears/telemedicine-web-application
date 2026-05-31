import {
  ForbiddenError,
  requireRole,
  UnauthorizedError,
} from "@/lib/auth/current-user";
import { forbidden, unauthorized } from "@/lib/auth/responses";
import { prisma } from "@/lib/prisma";
import { downloadProfileImageObject } from "@/lib/supabase/storage";

type PatientImageRouteContext = {
  params: Promise<{ userId: string }>;
};

function notFound() {
  return Response.json({ error: "Image not found." }, { status: 404 });
}

export async function GET(_request: Request, context: PatientImageRouteContext) {
  try {
    const user = await requireRole("PATIENT", "DOCTOR");
    const { userId } = await context.params;

    if (user.role === "PATIENT" && user.id !== userId) {
      return notFound();
    }

    if (user.role === "DOCTOR") {
      const assignedConsultation = await prisma.consultation.findFirst({
        where: {
          doctor: { userId: user.id },
          patient: { userId },
        },
        select: { id: true },
      });

      if (!assignedConsultation) {
        return notFound();
      }
    }

    const profileUser = await prisma.user.findFirst({
      where: { id: userId, role: "PATIENT" },
      select: { avatarStoragePath: true },
    });

    if (!profileUser?.avatarStoragePath) {
      return notFound();
    }

    const result = await downloadProfileImageObject(profileUser.avatarStoragePath);

    if (result.error || !result.data) {
      return notFound();
    }

    return new Response(result.data, {
      headers: {
        "Cache-Control": "private, max-age=60",
        "Content-Type": result.data.type || "application/octet-stream",
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

    return Response.json({ error: "Unable to load image." }, { status: 500 });
  }
}
