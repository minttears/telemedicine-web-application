import {
  clearSessionCookie,
  destroySession,
  getSessionCookie,
} from "@/lib/auth/session";
import { clearTwoFactorChallengeCookie } from "@/lib/auth/two-factor";

export async function POST() {
  const sessionToken = await getSessionCookie();

  if (sessionToken) {
    await destroySession(sessionToken);
  }

  await clearSessionCookie();
  await clearTwoFactorChallengeCookie();

  return Response.json({ success: true });
}
