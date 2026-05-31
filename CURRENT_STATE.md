# Current State

## Project Goal

Build a Next.js telemedicine MVP where patients register, choose doctors, book consultation slots, and exchange consultation messages with assigned doctors. PostgreSQL through Prisma remains the source of truth.

## Current Stack

- Next.js App Router, React, TypeScript, Node.js runtime
- Tailwind CSS for UI
- Prisma ORM with Supabase Postgres
- Custom session-cookie authentication
- Supabase Storage is implemented for first-version secure consultation file attachments
- Supabase Realtime is planned but not implemented in active workflows
- Vercel is the target deployment platform

## Completed Major Phases

- Project scaffold, Tailwind, scripts, base routes, and Prisma setup
- Initial Prisma schema, migration, Prisma runtime, and development seed data
- Custom session-cookie authentication, login, logout, patient registration, and role-protected workspace layouts
- Responsive patient, doctor, and admin workspace shells
- Patient doctor directory and patient-only doctor profile details
- Patient consultation booking with transactional slot booking
- Doctor consultation list/detail views
- Consultation detail shells for patient and doctor views
- PostgreSQL/Prisma text chat persistence
- Safe polling-based chat refresh with server-rendered authorized reads
- Doctor schedule management with future slot creation, soft cancellation of future `AVAILABLE` slots, and 30-minute minimum lead time
- Phase 7B code-level MVP workflow QA and small copy/documentation polish
- Phase 8A first-version doctor-only consultation completion summary
- Phase 8B consultation history filters and read-only completed chat
- Phase 9B first-version secure consultation file attachments
- Phase 10A first-version admin doctor management MVP
- Phase 10B first-version admin specialty management MVP
- Phase 10C MVP UI copy and workflow polish
- Phase 11A access token schema and backend foundation for future doctor invite and password reset flows
- Phase 11B Admin Doctor Invite MVP
- Phase 11C Admin-Generated Doctor Password Reset Links
- Phase 11D Patient And Doctor Profile Settings MVP
- Phase 11F Email Provider Foundation
- Phase 11G Public Forgot Password Flow
- Phase 11H Auth Recovery Manual QA Record
- Phase 12A MVP Technical Cleanup
- Phase 12B MVP UX Polish And Small Auth UI Improvements

## Current MVP Behavior

- Patients can register, log in, browse doctors, open doctor profiles, book future `AVAILABLE` slots at least 30 minutes away, view consultations, send/read text messages, upload/download allowed consultation files, and view a read-only doctor summary after completion.
- Doctors can log in, manage future schedule slots, cancel future `AVAILABLE` slots, view assigned consultations, send/read text messages, upload/download allowed consultation files, and complete assigned `SCHEDULED` or `IN_PROGRESS` consultations with one plain-text conclusion/recommendations summary.
- Patients can open `/patient/profile`, view email/name/date of birth/gender/account status, and edit only name, date of birth, and gender.
- Doctors can open `/doctor/profile`, view email/name/title/specialty/bio/education/experience/account status/booking availability, and edit only title, bio, and education.
- Email, role, account status, specialty, experience years, and booking availability remain protected/admin-controlled where appropriate.
- Booking creates a `SCHEDULED` consultation and changes the selected slot from `AVAILABLE` to `BOOKED` inside a Prisma transaction.
- Patient and doctor consultation reads are server-rendered and scoped by current profile ownership.
- Patient and doctor consultation lists support `Upcoming`, `Completed`, and `All` history filters.
- Completed consultations remain visible in consultation history and stay accessible from the completed and all filters.
- Message creation uses `POST /api/messages`, stores `MessageType.TEXT`, trims body text, and enforces a 2000-character limit.
- File attachment upload uses server-mediated `POST /api/files`, stores `MessageType.FILE` plus `Attachment` metadata in PostgreSQL, and stores file bytes only in the private Supabase Storage bucket.
- File attachment download uses server-mediated `GET /api/files/[attachmentId]` and verifies consultation ownership/assignment before returning file bytes.
- Patients can upload/download attachments only for consultations owned by their `PatientProfile`.
- Doctors can upload/download attachments only for consultations assigned to their `DoctorProfile`.
- Allowed attachment types are PDF, JPG/JPEG, PNG, and DOCX, with a 10 MB maximum file size.
- Secure consultation file attachments were manually verified in the browser for patient upload/download, assigned-doctor download, completed read-only upload behavior, logged-out rejection, admin rejection, other-patient rejection, server-mediated download links, hidden `storagePath`, no public Storage URLs, and no visible browser secrets.
- Public registration remains patient-only; doctors are created by admins and cannot self-register publicly.
- Admin can list doctors, create `DOCTOR` users with linked `DoctorProfile` records, assign existing active specialties, edit basic doctor account/profile fields, deactivate doctor accounts, and control patient-facing booking availability.
- Admin doctor creation now defaults to invite mode. Temporary-password doctor creation remains available as a fallback.
- Invite-created doctors start inactive and unavailable for booking. After successful password setup, `User.isActive` becomes true while `DoctorProfile.isAvailable` remains false until an admin enables booking.
- Doctor invite links are restricted to onboarding-only accounts where `User.passwordChangedAt` is null and `User.isActive` is false. They are shown once in the admin UI, expire after 7 days, and are one-time-use. Only token hashes are stored.
- The doctor set-password flow redirects doctors to login after password setup and revokes existing doctor sessions.
- Admins can generate one-time password reset links for existing doctor accounts without an email provider or public forgot-password flow.
- Completed/setup doctors must use password reset instead of invite. The invite API enforces this server-side, returns a safe `409`, does not generate a new invite token, and invalidates that doctor's unused, unexpired invite tokens before returning.
- Doctor password reset links are shown once in the admin UI, expire after 1 hour, and are one-time-use. Only token hashes are stored.
- Doctor password reset revokes existing doctor sessions, updates `User.passwordChangedAt`, and preserves the doctor's current account active state and booking availability state.
- Admin can list, create, edit, deactivate, and reactivate specialties used by doctor profiles and patient directory filters.
- `User.isActive` controls doctor account access, while `DoctorProfile.isAvailable` controls patient-facing directory and booking visibility.
- `Specialty.isActive` controls whether specialties appear in doctor creation and patient filter options.
- Existing doctors linked to inactive specialties remain intact and may remain visible to patients when the doctor account is active and `DoctorProfile.isAvailable` is true.
- Inactive or unavailable doctors are hidden from the patient doctor directory and patient booking views, and the booking API rejects inactive or unavailable doctor slot booking.
- Chat auto-refresh uses polling with `router.refresh()` every 5 seconds only while the document is visible.
- Consultation completion uses existing `Consultation.doctorNotes` for the MVP doctor summary, sets `Consultation.status` to `COMPLETED`, and sets `Consultation.completedAt`.
- Completed consultations show preserved chat history in read-only mode.
- Completed consultations show existing file messages read-only and reject new file uploads.
- `POST /api/messages` rejects completed consultations with a safe `409`, while non-completed consultation chat remains writable.
- Admin has no attachment content access in this phase.
- Admin doctor management is implemented for the MVP, while broader operational management remains deferred.
- Login and patient-facing workflow copy now reflects current MVP behavior for patient registration, doctor discovery, booking, chat, file attachments, consultation history, and admin-created doctor/specialty management.
- The schema includes hashed, expiring, one-time account access tokens for doctor invites and future password reset flows. Raw invite/reset tokens are not stored.
- Resend is selected as the MVP transactional email provider. Public forgot-password sends reset instructions by email for eligible active patients and completed/setup doctors without revealing whether an account exists.
- Public forgot-password excludes admins and invite-only inactive onboarding doctors in this phase.
- Public password reset tokens expire after 1 hour, are one-time-use, store only hashes, revoke existing sessions after success, and redirect to login without auto-login.
- Raw public reset tokens appear only inside emailed reset links and are never stored, logged, audited, printed, or shown in the UI.
- A critical forgot-password account-targeting bug was fixed: the login page now requires an email before starting recovery, `/forgot-password` no longer shows an editable email field, the public forgot-password endpoint accepts one email only, reset email is sent only to the matched stored `User.email`, and reset completion derives the target user only from the `PASSWORD_RESET` token.
- Phase 11H manual QA rechecked the corrected auth recovery UX: forgot-password requires the login email first, an empty login email shows a validation message before recovery starts, users can no longer choose a separate reset recipient email, reset email delivery works for the Resend account email test case, and the corrected UX was accepted.
- The Phase 11H manual QA record confirms no reset URL, raw reset token, email API key, or secret was shared. Full testing to arbitrary recipient emails is deferred until a verified sender domain is configured in Resend; `onboarding@resend.dev` remains suitable only for limited local testing.
- Phase 12A narrowed broad Prisma `user` relation reads in server pages/helpers to avoid unnecessary password-hash retrieval, refreshed stale unsupported GET endpoint wording, and updated clearly stale security/task documentation without changing product behavior.
- Phase 12B added accessible show/hide controls to auth and admin temporary-password fields, improved patient/doctor/admin dashboard summary cards, replaced the bare patient files placeholder with a workspace-style empty state, and preserved the email-first forgot-password flow.

## Deferred Features

- True Supabase Realtime subscriptions and the required custom auth/RLS/JWT security design
- 2FA enforcement, admin schedule management, admin patient/consultation management, admin break-glass/private consultation access, and billing/payment
- Broader admin management screens and audit-log workflows beyond Phase 10A doctor management and Phase 10B specialty management
- Virus scanning, advanced file previews, and production file-handling hardening
- Doctor profile/specialty management beyond seeded data
- Recurring schedules, booked slot cancellation, consultation cancellation, and status changes
- Legal prescription workflow, structured diagnosis/recommendation/follow-up fields, medical notes, and archives
- Time-based chat restrictions beyond completed-status read-only behavior
- Video calls, payments, 2FA enforcement, public SEO polish, and full responsive/browser QA

## Current Workflow Rules

- Plan before implementation for major phases.
- Do not commit or push without explicit user approval.
- Do not add dependencies without approval.
- Do not change Prisma schema or run migrations without approval.
- Do not edit `.env.local` or print secret values.
- Never print `.env.local`, `DATABASE_URL`, `DIRECT_URL`, passwords, hashes, cookies, session tokens, development seed password literals, or service role keys.
- Do not implement Supabase Realtime without a separate security plan.
- Use Tailwind only, no emoji, and keep the UI light, minimal, and medical-service oriented.
- After implementation, run validation and summarize changed files.
- If browser/dev-server smoke testing fails due to the Windows sandbox, record the limitation honestly and do not fake results.

## Latest Known Completed Phase

Phase 12B: MVP UX Polish And Small Auth UI Improvements.

Latest known commit:

- See `git log --oneline` for the latest committed hash.

## Next Recommended Phase

Choose the next MVP gap deliberately. Strong candidates are remaining admin patient/consultation/schedule management, public SEO/deployment readiness including Resend sender domain/DNS verification, broader authenticated browser QA, billing/payment, or production file-handling hardening. Supabase Realtime should remain deferred until a separate security plan is approved.
