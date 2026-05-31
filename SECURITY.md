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
- Public registration cannot create `DOCTOR` or `ADMIN` users.
- Public patient registration requires explicit legal consent in the UI and in the registration API.
- New patient registration stores nullable `termsAcceptedAt`, `privacyAcceptedAt`, `telemedicineConsentAcceptedAt`, and `legalConsentVersion` fields on `User`.
- Existing users are not blocked from login if historical consent fields are null; future re-consent remains deferred.
- Legal pages are MVP/demo legal copy and require qualified legal review before real production launch.
- Registration hashes passwords with `bcryptjs`.
- Duplicate registration email handling returns a safe conflict error.
- Registration must not log passwords, password hashes, cookies, session tokens, `DATABASE_URL`, `DIRECT_URL`, or `.env.local` contents.
- Registration must not log consent payloads together with passwords or other secrets.
- Login and registration UI must not display development seed account emails or password hints.
- Account access tokens for future invite/reset flows store only SHA-256 token hashes, never raw tokens.
- Account access tokens are one-time-use and expire.
- Doctor invite tokens store only SHA-256 token hashes, never raw tokens.
- Doctor invite tokens are one-time-use and expire after 7 days.
- Admin-generated doctor password reset tokens store only SHA-256 token hashes, never raw tokens.
- Admin-generated doctor password reset tokens are one-time-use and expire after 1 hour.
- Raw invite/reset tokens must be shown only once when explicitly required by a flow and must never be logged, audited, stored, printed, or re-displayed.
- Password reset URLs contain bearer tokens and must never be logged, audited, printed, or stored outside the intended one-time email or approved admin one-time display.
- Email provider API keys are server-only and must never use a `NEXT_PUBLIC_` environment variable name.
- Public forgot-password returns a generic response and must not reveal whether an account exists, is eligible, is missing, or is rate-limited.
- Public forgot-password recovery starts from the login page email field; the login page must require an email before navigating to recovery.
- The public `/forgot-password` page must not show an editable recipient email field.
- Public forgot-password accepts one account email only and must not accept or trust a separate recipient email, user id, account email, hidden target, or redirect identity.
- Public forgot-password must send reset email only to the matched user's stored `User.email`.
- Public forgot-password is available only for active `PATIENT` users and completed/setup `DOCTOR` users. `ADMIN` users and invite-only inactive onboarding doctors are excluded in this phase.
- Public reset password must identify the target account only from a valid, unused, unexpired `PASSWORD_RESET` token relation.
- Phase 11H manual QA confirmed the corrected recovery UX requires the login email first, validates an empty login email before recovery starts, removes separate recipient selection, sends reset email only for the intended Resend account email test case, and no reset URL, raw token, email API key, or secret was shared.
- Doctor set-password activates the invited doctor account, updates `User.passwordChangedAt`, revokes existing sessions for that doctor, and does not auto-login the doctor.
- Doctor password reset updates `User.passwordChangedAt`, revokes existing sessions for that doctor, preserves the current `User.isActive` value, preserves `DoctorProfile.isAvailable`, and does not auto-login the doctor.

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
- Admin doctor management pages are protected by the admin workspace layout.
- Admin doctor management APIs also require server-side `ADMIN` role checks with `requireRole("ADMIN")`; UI-only checks are not sufficient.
- Admin specialty management pages are protected by the admin workspace layout.
- Admin specialty management APIs also require server-side `ADMIN` role checks with `requireRole("ADMIN")`; UI-only checks are not sufficient.

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

Profile settings boundaries:

- `/patient/profile` is protected by the patient workspace layout and reads only the current user's `User` and `PatientProfile` fields through narrow Prisma selects.
- `PATCH /api/patient/profile` requires `PATIENT`, scopes updates to the current user's own `PatientProfile`, and can update only `User.name`, `PatientProfile.dateOfBirth`, and `PatientProfile.gender`.
- `/doctor/profile` is protected by the doctor workspace layout and reads only the current user's `User` and `DoctorProfile` fields through narrow Prisma selects.
- `PATCH /api/doctor/profile` requires `DOCTOR`, scopes updates to the current user's own `DoctorProfile`, and can update only `DoctorProfile.title`, `DoctorProfile.bio`, and `DoctorProfile.education`.
- Email, role, account status, specialty, experience years, and booking availability are not editable through self-service profile endpoints.
- Profile pages and APIs do not expose password hashes, token hashes, sessions, other users' patient data, chats, files, storage paths, cookies, tokens, environment values, service role keys, or other secrets.
- Patient avatar upload requires `PATIENT`, updates only the current user's `User.avatarStoragePath`, and serves the avatar only back to that same patient in this phase.
- Doctor photo upload requires `DOCTOR`, updates only the current doctor's `DoctorProfile.photoStoragePath`, and does not allow doctors to change specialty, experience, account status, booking availability, email, or role.
- Profile images use the private `profile-images` Supabase Storage bucket and server-mediated upload/image routes. The bucket must be created manually as private before browser upload QA.
- Profile image UI and API responses must not expose storage paths, private bucket paths, direct Supabase Storage URLs, or service role keys.
- Profile image validation allows only JPEG, PNG, and WEBP up to 2 MB. SVG and GIF are rejected in this phase.

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

Admin doctor management boundaries:

- Admins can create `DOCTOR` users with linked `DoctorProfile` records and assign existing active specialties.
- Admins can edit basic doctor account/profile fields, deactivate doctor accounts through `User.isActive`, and control patient-facing booking visibility through `DoctorProfile.isAvailable`.
- Temporary passwords are hashed with the existing password hashing helper, never returned after creation, never audited, never stored as plaintext, and never printed.
- Admin doctor creation defaults to invite mode, while temporary-password creation remains available as a fallback.
- Invite-created doctors start with `User.isActive=false` and `DoctorProfile.isAvailable=false`.
- Successful invite password setup sets `User.isActive=true` and leaves `DoctorProfile.isAvailable=false` until an admin enables booking.
- Admin-generated doctor invite links are shown once in the admin UI and are not returned again later.
- Doctor invite links are restricted to onboarding-only accounts where `User.passwordChangedAt` is null and `User.isActive` is false.
- Completed/setup doctors must use password reset instead of invite.
- `POST /api/admin/doctors/[doctorId]/invite` enforces the onboarding-only rule server-side; UI-only hiding is not the only protection.
- Completed/setup doctor invite attempts return a safe `409`, do not generate a new invite token, and invalidate that doctor's unused, unexpired invite tokens before returning.
- Admin-generated doctor password reset links are shown once in the admin UI and are not returned again later.
- `passwordHash` is never exposed in admin doctor pages or API responses.
- `tokenHash` is never exposed in admin doctor pages or API responses.
- Admin doctor pages do not expose patient private data, chat content, message text, attachment contents, storage paths, cookies, tokens, environment values, service role keys, or other secrets.
- Doctor create/update/deactivation audit logs use safe identifiers and changed field names only.
- Doctor invite creation and account password set audit logs use safe identifiers and changed field names only. They do not include raw tokens, token hashes, passwords, password hashes, cookies, session tokens, or environment values.
- Doctor password reset creation/completion audit logs use safe identifiers and changed field names only. They do not include raw tokens, token hashes, passwords, password hashes, cookies, session tokens, or environment values.
- Hard deletion of doctors is not implemented.

Admin specialty management boundaries:

- Admins can create, update, deactivate, and reactivate specialties.
- `Specialty.isActive` controls whether specialties appear in doctor creation and patient filter options.
- Inactive specialties are hidden from patient filter options.
- Specialty management does not expose patient private data, chat content, message text, attachment contents, storage paths, password hashes, cookies, tokens, environment values, service role keys, or other secrets.
- Specialty create/update/deactivation/reactivation audit logs use safe identifiers and changed field names only.
- Hard deletion of specialties is not implemented.

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
- Chat UI alignment and avatars/photos are presentation-only and do not change consultation ownership or assignment checks.
- Chat participant images use server-mediated profile image routes and must not render `avatarStoragePath`, `photoStoragePath`, private bucket paths, direct Supabase Storage URLs, or service role credentials.
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
- File messages in chat continue to download only through `/api/files/[attachmentId]` and never display `storagePath` or direct Supabase Storage URLs.
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
- `RESEND_API_KEY` is server-only and must not be imported into client components.
- Account access token helpers are server-only and must not be imported into client components.
- Email provider helpers are server-only and must not be imported into client components.
- Direct browser upload to Supabase Storage is not implemented.
- Public buckets and public file URLs are not used for consultation attachments.
- Public buckets and public file URLs are not used for profile images.
- Do not commit `.env.local` or real secrets.
- Do not log passwords, session tokens, 2FA secrets, or private file contents.

## Account Access Tokens

Phase 11A added the shared token foundation for future doctor invite and password reset flows. Phase 11B uses that foundation for the Admin Doctor Invite MVP. Phase 11C uses it for admin-generated doctor password reset links.

Rules:

- Store only SHA-256 token hashes in `AccountAccessToken.tokenHash`.
- Generate raw tokens with at least 32 bytes of secure randomness and `base64url` encoding.
- Use expiration timestamps and `usedAt` for one-time-use behavior.
- Treat missing, invalid, expired, and used tokens with generic errors in future public routes.
- Do not store, log, audit, print, or re-display raw invite/reset tokens.
- Do not expose token hashes, password hashes, cookies, session tokens, environment values, service role keys, or development seed password literals.
- Doctor invite tokens expire after 7 days and are one-time-use.
- Admin invite regeneration invalidates prior unused doctor invite tokens for that doctor.
- Doctor set-password supports inactive invited doctors only through a valid `DOCTOR_INVITE` token and requires the linked user role to be `DOCTOR`.
- Completed/setup doctor accounts cannot receive new onboarding invite tokens and must use password reset.
- Doctor password reset tokens expire after 1 hour and are one-time-use.
- Admin password reset generation invalidates prior unused password reset tokens for that doctor.
- Doctor password reset requires a valid `PASSWORD_RESET` token and the linked user role to be `DOCTOR`.
- Resend is selected as the MVP transactional email provider. The direct-fetch email helper is server-only and does not log provider secrets or email bodies.
- Public forgot-password sends reset instructions by email only for eligible users. Raw reset tokens appear only inside emailed reset links, and only token hashes are stored.
- Public forgot-password now uses the submitted normalized email only for account lookup and rate limiting; delivery uses the matched database `User.email` only.
- A `PASSWORD_RESET` token is tied to exactly one `userId`, and reset completion updates only that token's user.
- Public reset password accepts only token, password, and confirmation; identity fields such as email, account email, recipient email, target email, and user id are rejected with a generic invalid-link error.
- Public forgot-password uses simple in-memory route-level rate limiting as MVP abuse protection. Persistent distributed rate limiting remains a production hardening TODO.
- Phase 11H manually rechecked the previous account takeover issue and confirmed the corrected UX is acceptable. Full testing to arbitrary recipient emails is deferred until a verified sender domain is configured in Resend.
- 2FA remains deferred.

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
- `/patient/files` is a server-rendered archive of attachments scoped through consultations owned by the current patient.
- `/doctor/files` is a server-rendered archive of attachments scoped through consultations assigned to the current doctor.
- Files archive pages are metadata indexes only; uploads remain inside consultation chats/details.
- Files archive downloads use existing `/api/files/[attachmentId]` authorization and do not bypass the download route.
- Admin users cannot access attachment content in this phase.
- Completed consultations reject new uploads.
- Direct browser Supabase Storage upload is not implemented.
- Public buckets and public URLs are not used.
- `storagePath` is never displayed in the UI.
- Direct Supabase Storage object URLs and private bucket paths are never displayed in the Files archive UI.

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
- File deletion from archive pages.
- Free-standing uploads from archive pages.

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
Email provider secrets, including `RESEND_API_KEY`, must be configured only in `.env.local` and deployment environment variables.
`.env.local` must remain ignored and untracked. `onboarding@resend.dev` is suitable only for limited local testing until a verified Resend sender domain is configured.
Domain/DNS sender verification remains a deployment and email production readiness task.

Development seed credentials are development-only placeholders and must never be used in production.
Development seed credentials must not be printed in logs, terminal output, documentation, or chat summaries.
Development seed account hints must not be displayed in the login UI.

## MVP Security Checklist

Before considering MVP complete:

- [x] Passwords are hashed.
- [x] Sessions are server-side and cookie-based.
- [x] Cookies are HTTP-only.
- [x] Role checks exist for protected routes and implemented API handlers.
- [x] Patients cannot access other patients' consultations.
- [x] Doctors cannot access unassigned consultations.
- [x] Admin routes require `ADMIN` role.
- [x] Supabase service role key is never used in client code.
- [x] `.env.local` is ignored by Git.
- [x] File upload validation exists.
- [ ] Basic audit logging is partially implemented for admin/security actions; failed login and broader audit workflows remain TODO.

## Future Security Work

- Enforce 2FA for doctors and admins.
- Add recovery codes for 2FA.
- Define session expiration and refresh policy.
- Define file retention policy.
- Define data export and deletion policies.
- Add production monitoring and incident response procedures.
- Consider stronger compliance requirements before using real patient data.
