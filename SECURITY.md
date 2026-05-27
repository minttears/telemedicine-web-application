# Security

## Security Model

This application handles medical consultation data and must be designed with privacy, role boundaries, and auditability in mind.

The MVP is not a full production medical platform, but security decisions should avoid patterns that would be difficult to harden later.

## Authentication

Use custom session-cookie authentication.

Requirements:

- Hash passwords with a strong password hashing algorithm.
- Store sessions in PostgreSQL.
- Use HTTP-only cookies for session tokens.
- Use secure cookies in production.
- Validate sessions server-side.
- Revoke the current session on logout by setting `Session.revokedAt`.
- Redirect users by role after login.
- Return generic errors for failed login attempts.
- Show generic login UI errors only.
- Do not log passwords, cookies, session tokens, or password/session hashes from the login UI.
- Do not use Auth.js unless explicitly requested later.
- 2FA remains deferred until a later approved phase.
- Registration remains deferred until a later approved phase.

## Authorization

All protected data access must be checked server-side.

Role rules:

- `PATIENT`: can access only their own profile, consultations, messages, and files.
- `DOCTOR`: can access only assigned consultations, related patients, messages, and files.
- `ADMIN`: can manage operational records, but should not read private consultation chats without explicit need.

Expected helpers:

- `getCurrentUser`
- `requireUser`
- `requireRole`

Access checks must happen in backend/server code, not only in UI components.

Dashboard route protection and middleware are still future work. Current dashboard pages remain placeholders until a later approved phase adds protected layouts or middleware.

## Session And Cookie Requirements

Recommended cookie properties:

- `HttpOnly`
- `Secure` in production
- `SameSite=Lax` unless a stricter or cross-site requirement is identified
- fixed 7-day expiration for the initial auth foundation
- server-side invalidation through the `Session` table
- raw session tokens are never stored in the database
- only SHA-256 session token hashes are stored in the database

Pending decision:

- whether to use sliding renewal

## Data Protection

- PostgreSQL is the source of truth for users, profiles, sessions, consultations, messages, attachment metadata, and audit logs.
- Supabase Storage stores file blobs.
- Attachment metadata must include owner and consultation context.
- Never expose Supabase service role keys to the browser.
- Do not commit `.env.local` or real secrets.
- Do not log passwords, session tokens, 2FA secrets, or private file contents.

## Chat Privacy

- Patients see only their own consultation chats.
- Doctors see only chats for their own consultations.
- Admin chat access should be exceptional and auditable if implemented.
- Supabase Realtime should update the UI, while backend APIs remain responsible for authorization and persistence.

## File Upload Security

MVP allowed file types:

- PDF
- JPG
- PNG
- DOC/DOCX if convenient

Implementation should include:

- MIME type validation
- file extension validation
- file size limits
- per-user authorization checks
- storage paths that avoid leaking private information
- metadata records in PostgreSQL

Pending decision:

- exact file size limit
- exact MIME type allowlist
- file retention policy

## Audit Logging

Audit security-sensitive and administrative actions, including:

- login failures if practical
- user creation and deactivation
- doctor creation and profile changes by admins
- role changes
- consultation status changes
- file upload events
- exceptional access to private data, if ever implemented

Do not log:

- raw passwords
- session tokens
- 2FA codes or secrets
- full private chat content
- file contents

## Environment Variables

Required variables are listed in `.env.example`.

Secrets must be configured locally in `.env.local` and in Vercel environment variables. Do not commit real values.

## MVP Security Checklist

Before considering MVP complete:

- [ ] Passwords are hashed.
- [x] Sessions are server-side and cookie-based.
- [x] Cookies are HTTP-only.
- [ ] Role checks exist for protected routes and API handlers.
- [ ] Patients cannot access other patients' consultations.
- [ ] Doctors cannot access unassigned consultations.
- [ ] Admin routes require `ADMIN` role.
- [ ] Supabase service role key is never used in client code.
- [ ] `.env.local` is ignored by Git.
- [ ] File upload validation exists.
- [ ] Basic audit logging exists for admin/security actions.

## Future Security Work

- Enforce 2FA for doctors and admins.
- Add recovery codes for 2FA.
- Define session expiration and refresh policy.
- Define file retention policy.
- Define data export and deletion policies.
- Add production monitoring and incident response procedures.
- Consider stronger compliance requirements before using real patient data.
