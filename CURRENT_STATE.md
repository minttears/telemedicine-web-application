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
- MVP UX Polish And Small Auth UI Improvements
- Phase 12B Files Page Completion
- Phase 12C Legal Pages And Registration Consent
- Phase 12D Avatar And Doctor Photo Uploads
- Phase 12E Consultation Chat UI Polish
- Phase 12F Doctor Reviews And Ratings
- Phase 13A Consultation Treatment Plan / Doctor Recommendations
- Phase 13B Doctor Search Filters And Symptom Tags
- Phase 14B/14C Daily Video Provider Foundation And UI, superseded by Phase 14D
- Phase 14D LiveKit Video Provider And Call UI
- Phase 14E Video Call QA Polish
- Phase 15A Two-Factor Authentication Enforcement
- Phase 15B Two-Factor Management And Admin Reset
- Phase 15C Two-Factor Manual QA Record
- Phase 16B Russian Auth, 2FA, And Account UI
- Phase 16C Russian Patient Workspace UI
- Phase 16D Russian Doctor Workspace UI
- Phase 16E Russian Admin Workspace UI
- Phase 16F Public, Legal, Common UI And Final Russian Pass

## Current MVP Behavior

- Patients can register, log in, browse doctors, open doctor profiles, book future `AVAILABLE` slots at least 30 minutes away, view consultations, send/read text messages, upload/download allowed consultation files, use `/patient/files` as a secure consultation attachment archive, and view a read-only consultation outcome after completion.
- `ADMIN` and `DOCTOR` password login now requires TOTP setup or a TOTP/recovery-code challenge before a normal session is created; `PATIENT` login remains unchanged.
- TOTP secrets are encrypted at rest with AES-256-GCM, temporary challenge tokens and recovery codes are stored only as hashes, and recovery codes are one-time use.
- TOTP setup and login verification accept only the current 30-second code; previous and future time-step codes are rejected, so server and authenticator-device clocks must remain synchronized. One-time recovery codes remain the fallback.
- Doctor invite set-password and doctor/admin password reset do not disable or bypass 2FA. Initial 2FA setup revokes older privileged sessions before creating the first 2FA-satisfied session.
- `TWO_FACTOR_ENFORCEMENT_ENABLED` defaults to enabled unless explicitly set to `"false"`; self-disable remains deferred.
- Doctors can manage 2FA from `/doctor/security`; admins can manage their own 2FA from `/admin/settings`. Both surfaces show enabled status, enabled date, and remaining unused recovery-code count without exposing secrets, QR data, old codes, or hashes.
- Doctors and admins can regenerate 10 recovery codes after verifying their current password plus the current TOTP code or one unused recovery code. New plaintext codes are shown once; old unused codes are invalidated and used records remain for audit history.
- Admin doctor detail pages can reset a doctor's 2FA enrollment without revealing any secret or code. Reset removes enrollment, recovery codes, and pending challenges, revokes doctor sessions, preserves account activation, and forces setup at the next login.
- Self-disable remains deferred; `PATIENT` authentication and account behavior remain unchanged.
- Owner manual QA confirmed doctor/admin 2FA setup and password-login challenge behavior, confirmed recovery codes were saved, and confirmed old TOTP windows were rejected after strict current-step verification was added.
- Authenticated destructive management flows, including recovery-code regeneration and admin doctor 2FA reset, remain deployment-readiness QA items to re-check with controlled test accounts.
- Emergency local recovery may explicitly set `TWO_FACTOR_ENFORCEMENT_ENABLED="false"` temporarily. This is not the normal production posture. `TWO_FACTOR_ENCRYPTION_KEY` must remain stable after accounts enroll or stored TOTP secrets cannot be decrypted.
- Auth, registration, password recovery/reset, doctor invite/password setup, 2FA setup/challenge/management, admin doctor invite/password reset/2FA reset controls, and password-reset email copy now use formal Russian user-facing text.
- Brands, route paths, API fields, environment-variable names, enum values, role constants, cookies, confirmation tokens, and other technical identifiers remain unchanged.
- Phase 16B changed copy only: patient login still does not require 2FA, while doctor/admin setup, challenge, recovery-code, session, and enforcement behavior remain unchanged.
- Phase 16C translates the patient workspace, navigation, profile, doctor discovery, symptom labels, booking, consultations, chat, files, reviews, video-call UI, matching safe errors, and patient-facing date/time formatting into formal Russian.
- Phase 16C changes presentation copy only. Patient login, booking, consultation ownership, chat/file authorization, video access, routes, response shapes, status codes, sessions, cookies, redirects, and doctor/admin 2FA enforcement are unchanged.
- Specialty names, doctor titles, bios, education, personal names, consultation content, reviews, messages, and uploaded filenames remain database/user-generated content. English seed/demo medical text remains deferred to Phase 16F.
- Phase 16D translates the doctor workspace, navigation, dashboard, profile, schedule, development-only video QA controls, consultation lists/details/completion, files, patient placeholders, call pages, and matching safe errors into formal Russian.
- Phase 16D changes presentation copy only. Doctor schedule, consultation completion, chat/file/video authorization, routes, response shapes, status codes, sessions, cookies, redirects, strict TOTP verification, and required doctor/admin 2FA enforcement are unchanged.
- Specialty names, doctor titles, bios, education, personal names, patient-provided profile values, consultation content, messages, reviews, and uploaded filenames remain database/user-generated content. English seed/demo medical text remains deferred to Phase 16F.
- Phase 16E translates the admin navigation, dashboard, doctor and specialty management, user/consultation/audit placeholders, settings context, admin forms, safe visible API errors, accessibility labels, and admin date/time formatting into formal Russian.
- Phase 16E changes presentation copy only. Admin authorization, doctor invite/password reset/2FA reset, specialties, audit records, routes, response shapes, status codes, sessions, cookies, redirects, strict TOTP verification, and required doctor/admin 2FA enforcement are unchanged. The typed `RESET 2FA` confirmation phrase remains unchanged.
- Specialty names, slugs, doctor titles, bios, education, personal names, role constants, audit action enum values, and other persisted or user-generated content remain unchanged. English seed/demo medical text remains deferred to Phase 16F.
- Phase 16F translates the landing page, public navigation/footer, public information pages, legal pages, root metadata, global error/not-found states, safe remaining API errors, and development video-QA presentation text into formal Russian. The root document language is now `ru`.
- Phase 16F translates seeded specialty names/descriptions and doctor titles/bios/education while preserving personal names, slugs, IDs, relationships, role constants, and enum values. Existing database rows are updated only if the idempotent seed is intentionally rerun; no database reset or migration was performed.
- The final English-string audit intentionally preserves vendor and protocol names, `Email`, `Slug`, API/URL/QR/2FA/TOTP/ID/SMS/WebAuthn/passkeys, MIME/image formats, route paths, environment names, package names, enum values, role constants, audit action values, internal server exceptions/log messages, and confirmation contracts such as `RESET 2FA`.
- Phase 16F changes presentation and seed copy only. Authentication, 2FA, booking, consultation, chat, file, video, review, authorization, route, response, status-code, cookie, session, and redirect behavior remain unchanged.
- Patient doctor directory supports name, specialty, and symptom-helper filtering. Symptom filtering maps curated symptom slugs to active specialty slugs and is a doctor-discovery helper only, not diagnosis, AI triage, or emergency medical advice.
- Patient doctor directory still shows only active `DOCTOR` users with `DoctorProfile.isAvailable=true` and active specialties.
- Doctors can log in, manage future schedule slots, cancel future `AVAILABLE` slots, view assigned consultations, send/read text messages, upload/download allowed consultation files, use `/doctor/files` as a secure assigned-consultation attachment archive, and complete assigned `SCHEDULED` or `IN_PROGRESS` consultations with structured consultation outcome fields.
- New structured consultation completion requires only a conclusion/summary in `Consultation.doctorNotes` and an active diagnosis-status selection; diagnosis details, doctor recommendations, medication notes, follow-up instructions, and additional notes are optional and stored as null when empty.
- Diagnosis status supports no diagnosis identified, preliminary diagnosis, requires further examination, referred to specialist, and not applicable without forcing fake diagnosis text.
- Consultation outcome is not an official prescription workflow; legal prescription workflows, medication databases, PDF generation, e-signatures, pharmacy integration, and diagnosis automation remain deferred.
- Patients can submit one doctor review with a required 1-5 rating and optional comment only after their own consultation is completed.
- Doctor rating summaries appear on patient doctor cards and patient doctor detail pages; patient doctor detail pages show recent reviews with the public author label `Verified patient`.
- Patient completed consultation detail pages show the review form when eligible and no review exists, then show the submitted review after creation.
- Doctors can view their rating/recent reviews on authenticated doctor dashboard/profile surfaces, but cannot create, edit, delete, reply to, or moderate reviews.
- Patients can upload/update a private self-only avatar from `/patient/profile`; the avatar is stored in the private `profile-images` Supabase bucket and served through a server-mediated route.
- Doctors can upload/update their own professional photo from `/doctor/profile`; doctor photos are stored in the private `profile-images` bucket and shown through server-mediated routes on patient-facing doctor cards/profile pages.
- Patients can open `/patient/profile`, view email/name/date of birth/gender/account status, and edit only name, date of birth, and gender.
- Doctors can open `/doctor/profile`, view email/name/title/specialty/bio/education/experience/account status/booking availability, and edit only title, bio, and education.
- Email, role, account status, specialty, experience years, and booking availability remain protected/admin-controlled where appropriate.
- Booking creates a `SCHEDULED` consultation and changes the selected slot from `AVAILABLE` to `BOOKED` inside a Prisma transaction.
- Patient and doctor consultation reads are server-rendered and scoped by current profile ownership.
- Patient and doctor consultation lists support `Upcoming`, `Completed`, and `All` history filters.
- Completed consultations remain visible in consultation history and stay accessible from the completed and all filters.
- Consultation chat now uses messenger-style bubbles: current user messages align right, other participant messages align left, and patient avatars/doctor photos are shown through safe app routes when available.
- Message creation uses `POST /api/messages`, stores `MessageType.TEXT`, trims body text, and enforces a 2000-character limit.
- File attachment upload uses server-mediated `POST /api/files`, stores `MessageType.FILE` plus `Attachment` metadata in PostgreSQL, and stores file bytes only in the private Supabase Storage bucket.
- File attachment download uses server-mediated `GET /api/files/[attachmentId]` and verifies consultation ownership/assignment before returning file bytes.
- Patients can upload/download attachments only for consultations owned by their `PatientProfile`.
- Doctors can upload/download attachments only for consultations assigned to their `DoctorProfile`.
- Patient and doctor Files pages are server-rendered archive/index pages for consultation attachments already shared inside consultation chats; they do not add free-standing uploads, previews, deletion, storage cleanup, or direct Supabase access.
- Files pages show safe attachment metadata only and use `/api/files/[attachmentId]` download links, preserving existing download authorization.
- Files pages do not expose `storagePath`, private bucket paths, or direct Supabase Storage URLs.
- Profile images do not expose storage paths, private bucket paths, or direct Supabase Storage URLs. Manual Supabase setup requires a private `profile-images` bucket.
- Allowed attachment types are PDF, JPG/JPEG, PNG, and DOCX, with a 10 MB maximum file size.
- Secure consultation file attachments were manually verified in the browser for patient upload/download, assigned-doctor download, completed read-only upload behavior, logged-out rejection, admin rejection, other-patient rejection, server-mediated download links, hidden `storagePath`, no public Storage URLs, and no visible browser secrets.
- Public registration remains patient-only; doctors are created by admins and cannot self-register publicly.
- Patient registration requires acceptance of the Terms of Use, Privacy Policy, and Telemedicine Consent in the UI and in the registration API.
- New patient registrations store nullable account-level consent timestamps and `legalConsentVersion` on `User`; existing users are not blocked from login by this phase.
- `/terms`, `/privacy`, and `/telemedicine-consent` are public MVP/demo legal pages and require qualified legal review before real production launch.
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
- Consultation completion uses existing `Consultation.doctorNotes` as the required conclusion/summary, stores nullable structured outcome fields when provided, sets `Consultation.status` to `COMPLETED`, and sets `Consultation.completedAt`.
- Completed consultations show preserved chat history in read-only mode.
- Completed consultations show existing file messages read-only and reject new file uploads.
- `POST /api/messages` rejects completed consultations with a safe `409`, while non-completed consultation chat remains writable.
- Phase 14D replaced Daily with LiveKit as the active MVP video provider because Daily required a payment method for real calls.
- `POST /api/consultations/[consultationId]/call/session` now issues short-lived LiveKit participant tokens for random consultation-specific room names stored in `ConsultationCallSession`.
- Video call session creation is allowed only for authenticated patients who own the consultation and assigned doctors, rejects admins and wrong users, rejects completed/cancelled consultations, and is available only from consultation start through consultation end for `SCHEDULED` and `IN_PROGRESS` consultations.
- Doctor start/join prepares the LiveKit session and moves a `SCHEDULED` consultation to `IN_PROGRESS`; patient join prepares a token without completing the consultation.
- LiveKit participant tokens are returned only from the authenticated API response, are not stored in PostgreSQL, are not shown in the UI, and `LIVEKIT_API_SECRET` remains server-only.
- Patient and doctor consultation detail pages show a LiveKit video call panel that links to role-scoped call pages.
- Phase 14D keeps `/patient/consultations/[consultationId]/call` and `/doctor/consultations/[consultationId]/call` with LiveKit official React components.
- The LiveKit call UI requests the existing authenticated call-session API only after the participant clicks join/start and keeps the short-lived token in memory only.
- LiveKit components handle camera/microphone permissions, mute, camera toggle, local/remote video, and leave controls. Screen sharing is disabled in token grants and UI controls. Leave returns to a safe ended state with a back-to-consultation action.
- Phase 14E added a development-only doctor QA action on the schedule page to create a near-now test consultation starting now or in 5 minutes. It is unavailable in production and requires an authenticated doctor.
- LiveKit video calls were confirmed working locally after restoring correct system time; the earlier invalid-token behavior was caused by testing with modified system time.
- Manual QA confirmed assigned doctor and owning patient can join the same LiveKit call, camera/microphone work, Leave works, access is limited to the consultation start-through-end window, completed/cancelled consultations reject video access, and admin/wrong patient/wrong doctor cannot join.
- Local video QA must not change system time because LiveKit participant tokens depend on the real clock. Use the dev-only QA action instead. Local phone testing needs an HTTPS-accessible app URL such as a Vercel preview or HTTPS tunnel because plain LAN HTTP may not allow camera or microphone access.
- Built-in LiveKit chat remains a known limitation; persisted consultation chat in PostgreSQL remains the source of truth for medical consultation messages.
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
- MVP UX polish added accessible show/hide controls to auth and admin temporary-password fields, improved patient/doctor/admin dashboard summary cards, replaced the bare patient files placeholder with a workspace-style empty state, and preserved the email-first forgot-password flow.
- Phase 12B completed patient and doctor Files pages as secure consultation attachment archives while keeping uploads inside consultation chats only and leaving admin file content access deferred.
- Phase 12C added MVP legal pages and registration consent persistence/enforcement without adding doctor/admin public registration, email change, 2FA, deletion, retention, re-consent, or production legal workflows.
- Phase 12D added patient avatar and doctor professional photo uploads with nullable private storage-path fields, server-side role checks, server-mediated image serving, 2 MB JPEG/PNG/WEBP validation, best-effort old-object cleanup, and no public bucket, direct Storage URLs, cropping/resizing, delete UI, reviews, or admin moderation workflow.
- Phase 12E polished consultation chat UI with aligned text/file bubbles, safe participant avatars/photos, unchanged polling, unchanged completed-chat read-only behavior, and no realtime, video calls, message editing/deleting, reactions, read receipts, typing indicators, schema changes, migrations, dependencies, or admin chat access.
- Phase 12F added `DoctorReview` with migration `20260531163859_add_doctor_reviews`, patient-only completed-consultation review creation, one-review-per-consultation enforcement, doctor rating aggregation, `Verified patient` review display, and no review editing/deletion, doctor replies, admin moderation, public placeholder `/doctors` changes, dependencies, or denormalized rating fields.
- Phase 13A added nullable structured consultation outcome fields with migration `20260531215443_add_consultation_outcome_fields`, kept `Consultation.doctorNotes` for backward-compatible summaries, required diagnosis status only for new structured completion submissions, and did not add official prescriptions, doctor outcome editing after completion, admin medical content access, dependencies, or AI diagnosis automation.
- Phase 13B added symptom-based doctor filtering through a curated in-code symptom-to-specialty map, expanded idempotent development seed specialties/doctors/future slots, and did not add schema changes, migrations, AI diagnosis, triage, emergency-care workflows, dependencies, or booking logic changes.

## Deferred Features

- True Supabase Realtime subscriptions and the required custom auth/RLS/JWT security design
- Admin schedule management, admin patient/consultation management, admin break-glass/private consultation access, and billing/payment
- Broader admin management screens and audit-log workflows beyond Phase 10A doctor management and Phase 10B specialty management
- Virus scanning, advanced file previews, and production file-handling hardening
- Doctor profile/specialty management beyond seeded data
- Recurring schedules, booked slot cancellation, consultation cancellation, and status changes
- Legal prescription workflow, official prescriptions, medication database, PDF generation, e-signature, pharmacy integration, diagnosis automation, medical archives, and doctor outcome editing after completion
- Review editing/deletion, doctor replies, admin review moderation, and public placeholder `/doctors` review display
- Time-based chat restrictions beyond completed-status read-only behavior
- Full production video device/network QA, call end persistence, payments, public SEO polish, and full responsive/browser QA
- Symptom severity scoring, patient medical questionnaire, AI triage, emergency-care workflow, and advanced doctor availability algorithms

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

Phase 16F: Public, Legal, Common UI And Final Russian Pass.

Latest known commit:

- See `git log --oneline` for the latest committed hash.

## Next Recommended Phase

Choose the next MVP gap deliberately. Strong candidates include production SEO/branding and deployment readiness, Resend sender domain/DNS verification, broader authenticated and responsive browser QA, admin patient/consultation/schedule management, billing/payment, or production file-handling hardening. Supabase Realtime should remain deferred until a separate security plan is approved.
