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
    expiresInHours === 1 ? "1 hour" : `${expiresInHours} hours`;

  return {
    html: `
      <div style="font-family: Arial, sans-serif; color: #0f172a; line-height: 1.6;">
        <h1 style="font-size: 20px; margin: 0 0 16px;">Reset your password</h1>
        <p>Use the link below to create a new password for your Telemedicine account.</p>
        <p>
          <a href="${escapedResetUrl}" style="display: inline-block; background: #0f766e; color: #ffffff; padding: 10px 14px; border-radius: 6px; text-decoration: none;">
            Reset password
          </a>
        </p>
        <p>This link expires in ${expirationText} and can be used only once.</p>
        <p>If you did not request a password reset, you can ignore this email.</p>
        <p style="font-size: 12px; color: #475569;">If the button does not work, copy and paste this link into your browser: ${escapedResetUrl}</p>
      </div>
    `.trim(),
    subject: "Reset your Telemedicine password",
    text: [
      "Reset your Telemedicine password",
      "",
      "Use the link below to create a new password for your Telemedicine account.",
      resetUrl,
      "",
      `This link expires in ${expirationText} and can be used only once.`,
      "If you did not request a password reset, you can ignore this email.",
    ].join("\n"),
    to: recipientEmail,
  };
}
