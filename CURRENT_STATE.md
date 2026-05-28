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

## Current MVP Behavior

- Patients can register, log in, browse doctors, open doctor profiles, book future `AVAILABLE` slots at least 30 minutes away, view consultations, send/read text messages, upload/download allowed consultation files, and view a read-only doctor summary after completion.
- Doctors can log in, manage future schedule slots, cancel future `AVAILABLE` slots, view assigned consultations, send/read text messages, upload/download allowed consultation files, and complete assigned `SCHEDULED` or `IN_PROGRESS` consultations with one plain-text conclusion/recommendations summary.
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
- `User.isActive` controls doctor account access, while `DoctorProfile.isAvailable` controls patient-facing directory and booking visibility.
- Inactive or unavailable doctors are hidden from the patient doctor directory and patient booking views, and the booking API rejects inactive or unavailable doctor slot booking.
- Chat auto-refresh uses polling with `router.refresh()` every 5 seconds only while the document is visible.
- Consultation completion uses existing `Consultation.doctorNotes` for the MVP doctor summary, sets `Consultation.status` to `COMPLETED`, and sets `Consultation.completedAt`.
- Completed consultations show preserved chat history in read-only mode.
- Completed consultations show existing file messages read-only and reject new file uploads.
- `POST /api/messages` rejects completed consultations with a safe `409`, while non-completed consultation chat remains writable.
- Admin has no attachment content access in this phase.
- Admin doctor management is implemented for the MVP, while broader operational management remains deferred.

## Deferred Features

- True Supabase Realtime subscriptions and the required custom auth/RLS/JWT security design
- Admin invite/password reset flow, 2FA enforcement, specialty CRUD, admin schedule management, admin patient/consultation management, and admin break-glass/private consultation access
- Broader admin management screens and audit-log workflows beyond Phase 10A doctor management
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

Phase 10A: Admin Doctor Management MVP.

Latest known commit:

- See `git log --oneline` for the latest committed Phase 10A hash after commit.

## Next Recommended Phase

Choose the next MVP gap deliberately. Strong candidates are remaining admin management, public SEO/deployment readiness, broader authenticated browser QA, invite/password reset flow, or production file-handling hardening. Supabase Realtime should remain deferred until a separate security plan is approved.
