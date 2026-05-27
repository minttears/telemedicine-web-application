import {
  clearSessionCookie,
  destroySession,
  getSessionCookie,
} from "@/lib/auth/session";

export async function POST() {
  const sessionToken = await getSessionCookie();

  if (sessionToken) {
    await destroySession(sessionToken);
  }

  await clearSessionCookie();

  return Response.json({ success: true });
}
