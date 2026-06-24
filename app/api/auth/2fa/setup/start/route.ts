import * as QRCode from "qrcode";

import {
  createTotpSecret,
  createTotpUri,
  encryptTwoFactorSecret,
  getActiveTwoFactorChallenge,
} from "@/lib/auth/two-factor";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

export async function POST() {
  const challenge = await getActiveTwoFactorChallenge();

  if (!challenge) {
    return Response.json(
      { error: "Войдите снова, чтобы продолжить." },
      { status: 401 },
    );
  }

  if (challenge.user.twoFactorSecret?.enabledAt) {
    return Response.json(
      { error: "Двухфакторная аутентификация уже включена." },
      { status: 409 },
    );
  }

  const secret = createTotpSecret();
  const encryptedSecret = encryptTwoFactorSecret(secret);
  const setupUri = createTotpUri({
    email: challenge.user.email,
    secret,
  });
  const qrDataUrl = await QRCode.toDataURL(setupUri, {
    errorCorrectionLevel: "M",
    margin: 1,
    width: 240,
  });

  await prisma.twoFactorSecret.upsert({
    where: {
      userId: challenge.userId,
    },
    create: {
      encryptedSecret,
      userId: challenge.userId,
    },
    update: {
      encryptedSecret,
    },
  });

  return Response.json({
    manualKey: secret,
    qrDataUrl,
  });
}
