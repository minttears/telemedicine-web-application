import {
  createRawAccountAccessToken,
  hashAccountAccessToken,
} from "@/lib/auth/access-tokens";
import { buildPasswordResetEmail } from "@/lib/email/password-reset-email";
import { sendTransactionalEmail } from "@/lib/email/resend";
import { prisma } from "@/lib/prisma";

const PASSWORD_RESET_EXPIRATION_HOURS = 1;
const RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000;
const RATE_LIMIT_MAX_ATTEMPTS = 5;
const genericForgotPasswordMessage =
  "If an account exists for this email, reset instructions have been sent.";

type ForgotPasswordBody = {
  email?: unknown;
};

type RateLimitEntry = {
  count: number;
  resetAt: number;
};

const globalForForgotPassword = globalThis as unknown as {
  forgotPasswordRateLimit?: Map<string, RateLimitEntry>;
};

const rateLimitStore =
  globalForForgotPassword.forgotPasswordRateLimit ?? new Map<string, RateLimitEntry>();

globalForForgotPassword.forgotPasswordRateLimit = rateLimitStore;

function genericResponse() {
  return Response.json({
    message: genericForgotPasswordMessage,
    success: true,
  });
}

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function getResetExpiresAt() {
  return new Date(Date.now() + PASSWORD_RESET_EXPIRATION_HOURS * 60 * 60 * 1000);
}

function getRequestIp(request: Request) {
  const forwardedFor = request.headers.get("x-forwarded-for");

  if (forwardedFor) {
    return forwardedFor.split(",")[0]?.trim() ?? "unknown";
  }

  return request.headers.get("x-real-ip")?.trim() || "unknown";
}

function isRateLimited(key: string) {
  const now = Date.now();
  const entry = rateLimitStore.get(key);

  if (!entry || entry.resetAt <= now) {
    rateLimitStore.set(key, {
      count: 1,
      resetAt: now + RATE_LIMIT_WINDOW_MS,
    });
    return false;
  }

  entry.count += 1;

  return entry.count > RATE_LIMIT_MAX_ATTEMPTS;
}

function buildResetUrl(rawToken: string) {
  const appUrl = process.env.APP_URL?.trim();

  if (!appUrl) {
    return null;
  }

  try {
    const url = new URL("/reset-password", appUrl);
    url.searchParams.set("token", rawToken);
    return url.toString();
  } catch {
    return null;
  }
}

function isEligibleForPublicReset(user: {
  doctorProfile: { id: string } | null;
  email: string;
  isActive: boolean;
  passwordChangedAt: Date | null;
  patientProfile: { id: string } | null;
  role: "ADMIN" | "DOCTOR" | "PATIENT";
}) {
  if (user.role === "PATIENT") {
    return user.isActive && Boolean(user.patientProfile);
  }

  if (user.role === "DOCTOR") {
    return Boolean(user.passwordChangedAt && user.doctorProfile);
  }

  return false;
}

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as ForgotPasswordBody | null;

  if (!body || typeof body !== "object") {
    return Response.json({ error: "Invalid request." }, { status: 400 });
  }

  const accountEmail =
    typeof body.email === "string" ? body.email.trim().toLowerCase() : "";

  if (!accountEmail || !isValidEmail(accountEmail)) {
    return Response.json(
      { error: "Enter a valid email address." },
      { status: 400 },
    );
  }

  const rateLimitKey = `${getRequestIp(request)}:${accountEmail}`;

  if (isRateLimited(rateLimitKey)) {
    return genericResponse();
  }

  const user = await prisma.user.findUnique({
    where: {
      email: accountEmail,
    },
    select: {
      doctorProfile: {
        select: {
          id: true,
        },
      },
      email: true,
      id: true,
      isActive: true,
      passwordChangedAt: true,
      patientProfile: {
        select: {
          id: true,
        },
      },
      role: true,
    },
  });

  if (!user || !isEligibleForPublicReset(user)) {
    return genericResponse();
  }

  const rawToken = createRawAccountAccessToken();
  const expiresAt = getResetExpiresAt();
  const resetUrl = buildResetUrl(rawToken);

  if (!resetUrl) {
    return genericResponse();
  }

  await prisma.$transaction(async (tx) => {
    await tx.accountAccessToken.updateMany({
      where: {
        expiresAt: {
          gt: new Date(),
        },
        type: "PASSWORD_RESET",
        usedAt: null,
        userId: user.id,
      },
      data: {
        usedAt: new Date(),
      },
    });

    await tx.accountAccessToken.create({
      data: {
        createdById: null,
        expiresAt,
        tokenHash: hashAccountAccessToken(rawToken),
        type: "PASSWORD_RESET",
        userId: user.id,
      },
    });

    await tx.auditLog.create({
      data: {
        action: "PASSWORD_RESET_CREATED",
        actorId: null,
        entityId: user.id,
        entityType: "User",
        metadata: {
          changedFields: ["accountAccessToken"],
          deliveryProvider: "resend",
          expiresAt: expiresAt.toISOString(),
          tokenType: "PASSWORD_RESET",
          userId: user.id,
          userRole: user.role,
        },
      },
    });
  });

  const emailMessage = buildPasswordResetEmail({
    expiresInHours: PASSWORD_RESET_EXPIRATION_HOURS,
    recipientEmail: user.email,
    resetUrl,
  });

  await sendTransactionalEmail(emailMessage);

  return genericResponse();
}
