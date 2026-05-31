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
    const user = await requireRole("PATIENT");
    const { userId } = await context.params;

    if (user.id !== userId) {
      return notFound();
    }

    const profileUser = await prisma.user.findFirst({
      where: { id: user.id, role: "PATIENT" },
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
