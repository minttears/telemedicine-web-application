import "server-only";

const RESEND_EMAILS_ENDPOINT = "https://api.resend.com/emails";

export type SendEmailInput = {
  html: string;
  subject: string;
  text: string;
  to: string;
};

export type SendEmailResult =
  | {
      ok: true;
      provider: "resend";
      providerMessageId: string | null;
    }
  | {
      ok: false;
      error: "EMAIL_CONFIG_MISSING" | "EMAIL_PROVIDER_UNSUPPORTED" | "EMAIL_SEND_FAILED";
      provider: "resend" | null;
    };

type ResendSuccessResponse = {
  id?: unknown;
};

function getEmailConfig() {
  const provider = process.env.EMAIL_PROVIDER?.trim().toLowerCase() ?? "";
  const apiKey = process.env.RESEND_API_KEY?.trim() ?? "";
  const from = process.env.EMAIL_FROM?.trim() ?? "";
  const replyTo = process.env.EMAIL_REPLY_TO?.trim() ?? "";

  if (!provider || !apiKey || !from) {
    return { ok: false as const, error: "EMAIL_CONFIG_MISSING" as const };
  }

  if (provider !== "resend") {
    return { ok: false as const, error: "EMAIL_PROVIDER_UNSUPPORTED" as const };
  }

  return {
    ok: true as const,
    apiKey,
    from,
    replyTo: replyTo || null,
  };
}

export async function sendTransactionalEmail({
  html,
  subject,
  text,
  to,
}: SendEmailInput): Promise<SendEmailResult> {
  const config = getEmailConfig();

  if (!config.ok) {
    return {
      error: config.error,
      ok: false,
      provider: config.error === "EMAIL_PROVIDER_UNSUPPORTED" ? null : "resend",
    };
  }

  try {
    const response = await fetch(RESEND_EMAILS_ENDPOINT, {
      body: JSON.stringify({
        from: config.from,
        html,
        reply_to: config.replyTo ?? undefined,
        subject,
        text,
        to,
      }),
      headers: {
        Authorization: `Bearer ${config.apiKey}`,
        "Content-Type": "application/json",
      },
      method: "POST",
    });

    if (!response.ok) {
      return {
        error: "EMAIL_SEND_FAILED",
        ok: false,
        provider: "resend",
      };
    }

    const result = (await response.json().catch(() => ({}))) as ResendSuccessResponse;

    return {
      ok: true,
      provider: "resend",
      providerMessageId: typeof result.id === "string" ? result.id : null,
    };
  } catch {
    return {
      error: "EMAIL_SEND_FAILED",
      ok: false,
      provider: "resend",
    };
  }
}
