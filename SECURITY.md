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
- Public registration is patient-only.
- Public doctor and admin registration are not allowed.
- Registration hashes passwords with `bcryptjs`.
- Duplicate registration email handling returns a safe conflict error.
- Registration must not log passwords, password hashes, cookies, session tokens, `DATABASE_URL`, `DIRECT_URL`, or `.env.local` contents.

## Authorization

All protected data access must be checked server-side.

Role rules:

- `PATIENT`: can access only their own profile, consultations, messages, and files.
- `DOCTOR`: can access only assigned consultations, related patients, messages, and files.
- `ADMIN`: can manage operational records, but should not read private consultation chats without explicit need.
- `/patient/*` workspace pages require the `PATIENT` role.
- `/doctor/*` workspace pages require the `DOCTOR` role.
- `/admin/*` workspace pages require the `ADMIN` role.
- Wrong-role users are redirected to their own dashboard.

Expected helpers:

- `getCurrentUser`
- `requireUser`
- `requireRole`

Access checks must happen in backend/server code, not only in UI components.

Workspace pages are protected by server-side layout checks. Dashboard shell data is role-scoped and read server-side.

Dashboard data boundaries:

- Patient dashboard reads only the current patient's profile and consultation counts.
- Doctor dashboard reads only the current doctor's profile, consultation counts, and upcoming available schedule slots.
- Admin dashboard uses aggregate counts only.
- Admin dashboard does not display audit log details, private messages, file contents, passwords, tokens, cookies, or environment secrets.

Doctor directory boundaries:

- `/patient/doctors` is protected by the existing patient workspace layout.
- The patient doctor directory uses server-side Prisma reads.
- Doctor and admin users are redirected away from `/patient/doctors`.
- Only directory-safe doctor profile fields are displayed.
- The doctor directory does not display private messages, files, passwords, hashes, cookies, tokens, or environment secrets.
- `/patient/doctors/[doctorId]` is protected by the existing patient workspace layout.
- Patient doctor profile detail pages use server-side Prisma reads.
- Patient doctor profile detail pages display only directory-safe doctor fields: name, title, specialty, bio, education, experience years, and availability status.
- The doctor profile schedule preview shows only future `AVAILABLE` slots and is read-only.
- Patient doctor profile detail pages show only bookable `AVAILABLE` slots that start at least 30 minutes from now.
- Doctor profile detail pages do not display consultations, booking controls, chat content, files, session tokens, cookies, passwords, password hashes, environment values, storage paths, or private account data.

Consultation booking boundaries:

- The booking API is patient-only.
- The booking API performs server-side role checks with `requireRole("PATIENT")`.
- Patients can create consultations only for their own `PatientProfile`.
- Patients cannot book past, unavailable, booked, or wrong-doctor schedule slots.
- Patients cannot book schedule slots that start less than 30 minutes from now.
- Expired `AVAILABLE` slots are hidden and not bookable, but are not auto-cleaned in Phase 7A.
- Double-booking is prevented with a Prisma transaction, a conditional slot update from `AVAILABLE` to `BOOKED`, and `Consultation.scheduleSlotId` uniqueness.
- Patient consultation list and detail pages show only consultations owned by the current patient.
- Booking and consultation pages must not print or display secrets, passwords, password hashes, cookies, session tokens, `DATABASE_URL`, `DIRECT_URL`, `.env.local` contents, development seed password literals, storage paths, private messages, or file contents.

Doctor schedule boundaries:

- Doctor schedule management is scoped to the current doctor's `DoctorProfile`.
- Doctors can create schedule slots only for their own profile.
- Doctors cannot create schedule slots that start less than 30 minutes from now.
- Doctors can cancel only future `AVAILABLE` slots in Phase 7A.
- `BOOKED` slot cancellation, consultation cancellation, and automatic expiration cleanup are not implemented in Phase 7A.

Doctor consultation boundaries:

- Doctor consultation pages are scoped by the current doctor profile.
- Doctors can see only consultations assigned to their own `DoctorProfile`.
- Missing, fake, or unassigned doctor consultation detail routes use safe not-found behavior.
- Patient, admin, and logged-out users are redirected away by the existing doctor workspace protection.
- Doctor consultation pages do not display or print patient email, patient phone, messages, attachments, storage paths, doctor notes, diagnosis, prescriptions, medical notes, cookies, tokens, passwords, password hashes, `DATABASE_URL`, `DIRECT_URL`, `.env.local` contents, or development seed password literals.

Consultation detail shell boundaries:

- Consultation detail shells remain scoped by patient or doctor ownership.
- Patient consultation detail pages show only consultations owned by the current patient.
- Doctor consultation detail pages show only consultations assigned to the current doctor.
- Patient users can read and send messages only for consultations owned by their `PatientProfile`.
- Doctor users can read and send messages only for consultations assigned to their `DoctorProfile`.
- Admin chat access is excluded in Phase 6A.
- `POST /api/messages` performs server-side role and consultation ownership checks.
- Phase 6B polling refresh reuses the existing patient and doctor page ownership checks.
- Phase 6B keeps authorized message reads server-rendered through Prisma.
- File placeholders remain static and do not query attachments.
- Consultation detail pages do not query or display attachments, storage paths, private notes, diagnosis, prescriptions, medical notes, cookies, tokens, passwords, password hashes, `DATABASE_URL`, `DIRECT_URL`, `.env.local` contents, or development seed password literals.
- Message bodies are rendered as plain React text, and `dangerouslySetInnerHTML` is not used.

API routes still need their own authorization checks in future phases. Layout protection only protects workspace page rendering.

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
- Admin chat access is not implemented in Phase 6A and should be exceptional and auditable if implemented later.
- Phase 6B does not expose messages through Supabase Realtime or anon/publishable clients.
- `SUPABASE_SERVICE_ROLE_KEY` is not used in client code.
- `Message` was not added to `supabase_realtime`.
- Direct client Postgres Changes remain deferred until custom auth plus RLS/JWT security design is approved.
- Supabase Realtime should update the UI, while backend APIs remain responsible for authorization and persistence.
- No passwords, password hashes, cookies, session tokens, `DATABASE_URL`, `DIRECT_URL`, `.env.local` contents, or development seed password literals should be printed or displayed.

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

Development seed credentials are development-only placeholders and must never be used in production.
Development seed credentials must not be printed in logs, terminal output, documentation, or chat summaries.

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
