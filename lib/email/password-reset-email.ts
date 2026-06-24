import "server-only";

export type PasswordResetEmailInput = {
  expiresInHours?: number;
  recipientEmail: string;
  resetUrl: string;
};

export type PasswordResetEmail = {
  html: string;
  subject: string;
  text: string;
  to: string;
};

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

export function buildPasswordResetEmail({
  expiresInHours = 1,
  recipientEmail,
  resetUrl,
}: PasswordResetEmailInput): PasswordResetEmail {
  const escapedResetUrl = escapeHtml(resetUrl);
  const expirationText =
    expiresInHours === 1 ? "1 час" : `${expiresInHours} ч.`;

  return {
    html: `
      <div style="font-family: Arial, sans-serif; color: #0f172a; line-height: 1.6;">
        <h1 style="font-size: 20px; margin: 0 0 16px;">Сброс пароля</h1>
        <p>Используйте ссылку ниже, чтобы создать новый пароль для аккаунта Telemedicine.</p>
        <p>
          <a href="${escapedResetUrl}" style="display: inline-block; background: #0f766e; color: #ffffff; padding: 10px 14px; border-radius: 6px; text-decoration: none;">
            Сбросить пароль
          </a>
        </p>
        <p>Ссылка действует ${expirationText} и может быть использована только один раз.</p>
        <p>Если вы не запрашивали сброс пароля, проигнорируйте это письмо.</p>
        <p style="font-size: 12px; color: #475569;">Если кнопка не работает, скопируйте ссылку и вставьте её в браузер: ${escapedResetUrl}</p>
      </div>
    `.trim(),
    subject: "Сброс пароля Telemedicine",
    text: [
      "Сброс пароля Telemedicine",
      "",
      "Используйте ссылку ниже, чтобы создать новый пароль для аккаунта Telemedicine.",
      resetUrl,
      "",
      `Ссылка действует ${expirationText} и может быть использована только один раз.`,
      "Если вы не запрашивали сброс пароля, проигнорируйте это письмо.",
    ].join("\n"),
    to: recipientEmail,
  };
}
