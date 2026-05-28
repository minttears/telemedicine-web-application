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
- Patient consultation history filters remain scoped to consultations owned by the current patient.
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
- Doctor consultation history filters remain scoped to consultations assigned to the current doctor's `DoctorProfile`.
- Only the assigned doctor can complete a consultation in Phase 8A.
- The completion endpoint scopes by consultation id and `doctor.userId` for the current user.
- Patients, admins, and wrong doctors cannot complete consultations.
- Completion stores plain text in `Consultation.doctorNotes`, sets `Consultation.status` to `COMPLETED`, and sets `Consultation.completedAt`.
- `doctorNotes` is rendered as React text with preserved whitespace and without `dangerouslySetInnerHTML`.
- No legal prescription workflow is implemented in Phase 8A.
- Chat and message history are not deleted on consultation completion.
- Completed consultations are read-only for chat in Phase 8B.
- Missing, fake, or unassigned doctor consultation detail routes use safe not-found behavior.
- Patient, admin, and logged-out users are redirected away by the existing doctor workspace protection.
- Doctor consultation pages do not display or print patient email, patient phone, attachments, storage paths, diagnosis, prescriptions, medical notes, cookies, tokens, passwords, password hashes, `DATABASE_URL`, `DIRECT_URL`, `.env.local` contents, service role keys, or development seed password literals.

Consultation detail shell boundaries:

- Consultation detail shells remain scoped by patient or doctor ownership.
- Patient consultation detail pages show only consultations owned by the current patient.
- Doctor consultation detail pages show only consultations assigned to the current doctor.
- Patient users can read and send messages only for consultations owned by their `PatientProfile`.
- Doctor users can read and send messages only for consultations assigned to their `DoctorProfile`.
- Admin chat and consultation history access is excluded in Phase 8B.
- `POST /api/messages` performs server-side role and consultation ownership checks.
- `POST /api/messages` rejects completed consultations with a safe `409` response.
- Phase 6B polling refresh reuses the existing patient and doctor page ownership checks.
- Phase 6B keeps authorized message reads server-rendered through Prisma.
- File placeholders remain static and do not query attachments.
- Consultation detail pages do not query or display attachments, storage paths, private notes, diagnosis, prescriptions, medical notes, cookies, tokens, passwords, password hashes, `DATABASE_URL`, `DIRECT_URL`, `.env.local` contents, or development seed password literals.
- Message bodies are rendered as plain React text, and `dangerouslySetInnerHTML` is not used.
- Doctor completion summary text is rendered as plain React text, and `dangerouslySetInnerHTML` is not used.
- Completed consultation message history remains visible, but message records and consultation records are not deleted.
- File attachments use server-mediated Next.js route handlers and the private Supabase Storage bucket.
- Patients can upload and download files only for consultations owned by their `PatientProfile`.
- Doctors can upload and download files only for consultations assigned to their `DoctorProfile`.
- Admin users cannot access attachment content in this phase.
- Completed consultations reject new file uploads and show existing file messages read-only.
- Attachment UI shows safe metadata only and never displays `storagePath`.
- No secrets, cookies, session tokens, passwords, password hashes, `DATABASE_URL`, `DIRECT_URL`, `.env.local` contents, service role keys, or development seed password literals should be printed or displayed.

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
- `SUPABASE_SERVICE_ROLE_KEY` is server-only and must not be imported into client components.
- Direct browser upload to Supabase Storage is not implemented.
- Public buckets and public file URLs are not used for consultation attachments.
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

Consultation file attachments use a private Supabase Storage bucket.

Upload and download rules:

- Uploads and downloads are server-mediated through Next.js route handlers.
- Prisma/PostgreSQL remains the authorization source of truth.
- Supabase Storage stores file bytes only.
- PostgreSQL stores attachment metadata.
- Patients can upload/download only for consultations owned by their `PatientProfile`.
- Doctors can upload/download only for consultations assigned to their `DoctorProfile`.
- Admin users cannot access attachment content in this phase.
- Completed consultations reject new uploads.
- Direct browser Supabase Storage upload is not implemented.
- Public buckets and public URLs are not used.
- `storagePath` is never displayed in the UI.

MVP file limits and allowlist:

- Maximum size: 10 MB.
- PDF.
- JPG/JPEG.
- PNG.
- DOCX.

Implementation includes:

- MIME type validation.
- File extension validation.
- File size limits.
- Per-user authorization checks.
- storage paths that avoid leaking private information
- metadata records in PostgreSQL
- `FILE_UPLOADED` audit logs with safe metadata only.

Not included in the MVP:

- Virus scanning; this remains a production hardening gap.
- Advanced file previews.
- Admin break-glass attachment content access.
- File retention policy.

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
