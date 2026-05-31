import {
  ForbiddenError,
  requireRole,
  UnauthorizedError,
} from "@/lib/auth/current-user";
import { forbidden, unauthorized } from "@/lib/auth/responses";
import { prisma } from "@/lib/prisma";
import { downloadProfileImageObject } from "@/lib/supabase/storage";

type DoctorImageRouteContext = {
  params: Promise<{ doctorProfileId: string }>;
};

function notFound() {
  return Response.json({ error: "Image not found." }, { status: 404 });
}

export async function GET(_request: Request, context: DoctorImageRouteContext) {
  try {
    const user = await requireRole("PATIENT", "DOCTOR", "ADMIN");
    const { doctorProfileId } = await context.params;
    const doctor = await prisma.doctorProfile.findFirst({
      where: {
        id: doctorProfileId,
        ...(user.role === "PATIENT"
          ? {
              isAvailable: true,
              user: { isActive: true, role: "DOCTOR" },
            }
          : {}),
        ...(user.role === "DOCTOR" ? { userId: user.id } : {}),
      },
      select: { photoStoragePath: true },
    });

    if (!doctor?.photoStoragePath) {
      return notFound();
    }

    const result = await downloadProfileImageObject(doctor.photoStoragePath);

    if (result.error || !result.data) {
      return notFound();
    }

    return new Response(result.data, {
      headers: {
        "Cache-Control": "private, max-age=300",
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
