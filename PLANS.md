# Plans

## Current Plan

Phase 11F Email Provider Foundation is completed. Further implementation, commits, pushes, or pull requests should happen only when explicitly approved.

## Phase 0: Documentation And Alignment

Status: In progress

Goals:

- Create initial project documentation.
- Capture MVP scope and constraints.
- Document authentication, security, and deployment assumptions.
- Prepare an initial task backlog.
- Add rules for MCP usage, Git workflow, and Codex documentation updates.

Deliverables:

- `PROJECT_BRIEF.md`
- `AGENTS.md`
- `TASKS.md`
- `DECISIONS.md`
- `SECURITY.md`
- `PLANS.md`
- `.env.example`
- optional `.codex/config.toml.example`
- optional `MCP_SETUP.md`
- optional `CODEX_REREAD_PROMPT.md`

## Phase 1: Project Scaffold

Status: Completed

Goals:

- Initialize Next.js App Router with TypeScript.
- Add Tailwind CSS.
- Add Prisma setup.
- Prepare base scripts for dev, build, lint, typecheck, and Prisma workflows.
- Add initial folder structure for public, patient, doctor, admin, and API areas.

Completed:

- Created a root `app/` Next.js App Router scaffold.
- Configured TypeScript.
- Configured Tailwind CSS with base global styles.
- Configured ESLint.
- Created base app files: layout, home page, loading, error, not found, robots, and sitemap placeholders.
- Created placeholder route pages for public, auth, patient, doctor, and admin areas.
- Created API route placeholders for auth, consultations, messages, and files. These return `501 Not Implemented` only.
- Created scaffold folders for `components`, `lib`, `prisma`, and `public`.
- Installed Prisma packages: `prisma` and `@prisma/client`.

Deferred:

- Full Prisma schema and business models are deferred to Phase 2.
- Supabase connection is deferred to Phase 2.
- Authentication, chat, booking, file uploads, and admin business logic remain unimplemented.

Validation:

- `npm.cmd run lint` passed.
- `npm.cmd run typecheck` passed.
- `npm.cmd run build` passed.
- `npx.cmd prisma --version` passed.

MCP note:

- Context7 MCP and Playwright MCP setup failed in this session because Windows returned `Access is denied` when running `codex.exe`.
- MCP will be configured separately later.

## Phase 2: Data Model And Auth Foundation

Status: Not started

Goals:

- Create Prisma schema.
- Add `User` and `Session` models.
- Add patient and doctor profile models.
- Add specialty and basic schedule slot models.
- Prepare future 2FA models without exposing 2FA UI.
- Implement password hashing and session-cookie auth.
- Implement `getCurrentUser`, `requireUser`, and `requireRole`.

### Phase 2A: Prisma Schema And Database Foundation

Status: Completed

Completed:

- Created `prisma/schema.prisma`.
- Added all initial MVP Prisma models and enums for users, sessions, profiles, specialties, schedule slots, consultations, messages, attachments, audit logs, and future 2FA storage.
- Added `prisma.config.ts` for Prisma 7 configuration.
- Added `prisma/seed.ts` with development seed constants only.

Deferred:

- `prisma/seed.ts` was not executed.
- No migration was run.
- No Supabase connection was made.
- Authentication, UI, chat, file upload, booking, and admin business logic remain unimplemented.

Validation:

- `npx.cmd prisma format` passed.
- `npx.cmd prisma validate` passed.
- `npx.cmd prisma generate` passed.
- `npm.cmd run typecheck` passed.
- `npm.cmd run lint` passed.
- `npm.cmd run build` passed.

### Phase 2B: Supabase Postgres Connection And Initial Migration

Status: Completed

Completed:

- Created migration `20260527180124_init`.
- Applied migration `20260527180124_init` to Supabase Postgres.
- Used `.env.local` privately for local database connection values.
- Confirmed `.env.local` was not printed, staged, or committed.
- Confirmed `DATABASE_URL` uses port `6543` transaction pooler.
- Confirmed `DIRECT_URL` uses port `5432` session-mode pooler.
- Prisma migration commands temporarily mapped `DATABASE_URL = DIRECT_URL` inside the shell process only.

Deferred:

- Seed was not run.
- Authentication, UI, chat, booking, uploads, Supabase Realtime, Supabase Storage, and admin logic remain unimplemented.

Validation:

- `npx.cmd prisma format` passed.
- `npx.cmd prisma validate` passed.
- `npx.cmd prisma migrate dev --name init` passed.
- `npx.cmd prisma generate` passed.
- `npm.cmd run typecheck` passed.
- `npm.cmd run lint` passed.
- `npm.cmd run build` passed.

### Phase 2C: Development Seed Data

Status: Completed

Completed:

- Added `bcryptjs` for development seed password hashing.
- Added `@prisma/adapter-pg` for Prisma 7 runtime PostgreSQL access.
- Replaced `prisma/seed.ts` with runnable `prisma/seed.mjs`.
- Made `prisma/seed.mjs` idempotent where practical with upserts.
- Ran the seed successfully against Supabase using the private `DIRECT_URL` mapping approach.

Seeded development account emails:

- `admin@example.local`
- `doctor@example.local`
- `patient@example.local`

Safe seed counts:

- users: 3
- specialties: 4
- doctorProfiles: 1
- patientProfiles: 1
- scheduleSlots: 5

Security notes:

- No passwords or password hashes were recorded.
- `.env.local` was not printed, staged, or committed.

Deferred:

- Authentication, UI, chat, booking, uploads, Supabase Realtime, Supabase Storage, and admin logic remain unimplemented.

## Phase 3: Core MVP Workflows

Status: In progress

Goals:

- Patient registration and profile.
- Doctor list, filters, and profiles.
- Doctor schedule slots.
- Consultation booking.
- Role-specific dashboards.

### Phase 3A: Custom Session-Cookie Auth Foundation

Status: Completed

Completed:

- Implemented custom session-cookie auth foundation.
- Added Prisma runtime helper for server-side database access.
- Added password verification with `bcryptjs`.
- Added session helpers for token creation, SHA-256 token hashing, session creation, session revocation, and cookie handling.
- Added `getCurrentUser`, `requireUser`, `requireRole`, `unauthorized`, and `forbidden` helpers.
- Made the login API route functional.
- Made the logout API route revoke only the current session and clear the cookie.
- Kept the register API route as `501 Not Implemented`.

Security notes:

- Session cookie name is `telemedicine_session`.
- Session cookies are HTTP-only, secure in production, and use `SameSite=Lax`.
- Raw session tokens are never stored in PostgreSQL.
- Only SHA-256 session token hashes are stored in the `Session` table.

Deferred:

- No registration implementation.
- No UI forms.
- No dashboards.
- No middleware or layout route protection.
- No chat, booking, uploads, Supabase Realtime, Supabase Storage, or admin logic.

Validation:

- `npm.cmd run lint` passed.
- `npm.cmd run typecheck` passed.
- `npm.cmd run build` passed.
- `npx.cmd prisma validate` passed.

### Phase 3B: Login UI And Auth Smoke Test

Status: Completed

Completed:

- Added a working `/login` client-side form.
- Login form submits to the existing `/api/auth/login` route.
- Successful login uses `router.replace(redirectTo)`.
- Added development-only account email hints without passwords.
- Added already-authenticated `/login` redirect by role.
- Kept `/api/auth/register` as `501 Not Implemented`.

Role redirects:

- `ADMIN` -> `/admin/dashboard`
- `DOCTOR` -> `/doctor/dashboard`
- `PATIENT` -> `/patient/dashboard`

Manual smoke test results:

- `admin@example.local` login redirects to `/admin/dashboard`.
- `doctor@example.local` login redirects to `/doctor/dashboard`.
- `patient@example.local` login redirects to `/patient/dashboard`.
- Invalid credentials show a generic error.
- Already-authenticated `/login` redirects by role.
- Logout works through `POST /api/auth/logout`.
- No passwords, cookies, session tokens, hashes, `DATABASE_URL`, `DIRECT_URL`, or `.env.local` contents were printed.

Deferred:

- Registration remains unimplemented.
- Dashboards are still placeholders.
- No middleware or route protection layouts were implemented.
- No chat, booking, uploads, Supabase Realtime, Supabase Storage, or admin management logic was implemented.

Validation:

- `npm.cmd run lint` passed.
- `npm.cmd run typecheck` passed.
- `npm.cmd run build` passed.
- `npx.cmd prisma validate` passed.

### Phase 3C: Authenticated Layouts And Route Protection

Status: Completed

Completed:

- Added server-side protected layouts for patient, doctor, and admin workspaces.
- Protected layout files:
  - `app/patient/layout.tsx`
  - `app/doctor/layout.tsx`
  - `app/admin/layout.tsx`
- Logged-out users opening `/patient/*`, `/doctor/*`, or `/admin/*` are redirected to `/login`.
- Wrong-role users are redirected to their own dashboard:
  - `PATIENT` -> `/patient/dashboard`
  - `DOCTOR` -> `/doctor/dashboard`
  - `ADMIN` -> `/admin/dashboard`
- Added a minimal logout button that calls `POST /api/auth/logout` and returns users to `/login`.

Manual smoke test results:

- Logged-out workspace access redirects to `/login`.
- Patient access allows `/patient/*` and redirects away from doctor/admin workspaces.
- Doctor access allows `/doctor/*` and redirects away from patient/admin workspaces.
- Admin access allows `/admin/*` and redirects away from patient/doctor workspaces.
- Logout invalidates the current session.
- Raw HTTP status may be `200` for App Router server-component redirects, but browser navigation follows Next redirect markers.
- No passwords, password hashes, cookies, session tokens, `DATABASE_URL`, `DIRECT_URL`, or `.env.local` contents were printed.

Deferred:

- Registration remains unimplemented.
- Dashboards are still placeholders.
- API route authorization for business domains remains future work.
- No chat, booking, uploads, Supabase Realtime, Supabase Storage, or admin management logic was implemented.

Validation:

- `npm.cmd run lint` passed.
- `npm.cmd run typecheck` passed.
- `npm.cmd run build` passed.
- `npx.cmd prisma validate` passed.

### Phase 3D: Patient Registration

Status: Completed

Completed:

- Added a working `/register` patient registration page.
- Implemented `POST /api/auth/register`.
- Added `components/auth/register-form.tsx`.
- Added `hashPassword()` in `lib/auth/password.ts` using `bcryptjs.hash(password, 12)`.
- Public registration creates `PATIENT` users only.
- Public doctor and admin registration are not allowed from the UI or API.
- Registration normalizes email with trim and lowercase.
- Registration validates email, minimum 8-character password, matching password confirmation, optional date of birth, and optional gender.
- Registration hashes passwords before storage.
- Registration creates `User` and related `PatientProfile` together with a nested Prisma create.
- Successful registration creates a session and returns `redirectTo: /patient/dashboard`.
- Duplicate email returns `409 Conflict` with the safe error text `An account with this email cannot be registered.`

Implemented files:

- `app/(auth)/register/page.tsx`
- `app/api/auth/register/route.ts`
- `components/auth/register-form.tsx`
- `lib/auth/password.ts`

Smoke test results:

- `/register` page loads.
- No doctor/admin role option is exposed.
- Invalid email is rejected.
- Short password is rejected.
- Mismatched password confirmation is rejected.
- New patient registration succeeds.
- Registered user role is `PATIENT`.
- Successful registration returns `/patient/dashboard`.
- Registration sets a session cookie.
- New session can access the patient dashboard.
- Duplicate email returns the safe `409` conflict response.
- No passwords, password hashes, cookies, session tokens, `DATABASE_URL`, `DIRECT_URL`, or `.env.local` contents were printed.

Deferred:

- No public doctor/admin registration.
- No 2FA.
- Dashboards are still placeholders.
- No chat, booking, uploads, Supabase Realtime, Supabase Storage, or admin management logic was implemented.

Validation:

- `npm.cmd run lint` passed.
- `npm.cmd run typecheck` passed.
- `npm.cmd run build` passed.
- `npx.cmd prisma validate` passed.

## Phase 4: Consultation Chat And Files

Status: Not started

Goals:

- Persist messages through backend APIs.
- Add consultation chat UI.
- Add Supabase Realtime subscriptions for UI updates.
- Add Supabase Storage file attachments.
- Store attachment metadata in PostgreSQL.

### Phase 4A: Workspace Dashboard Shells

Status: Completed

Completed:

- Added responsive shell dashboards for patient, doctor, and admin workspaces.
- Added role-aware navigation to `WorkspaceShell`.
- Updated changed files:
  - `app/patient/dashboard/page.tsx`
  - `app/doctor/dashboard/page.tsx`
  - `app/admin/dashboard/page.tsx`
  - `app/patient/layout.tsx`
  - `app/doctor/layout.tsx`
  - `app/admin/layout.tsx`
  - `components/workspace/workspace-shell.tsx`
- Patient dashboard reads only the current patient profile and the current patient's consultation counts.
- Doctor dashboard reads only the current doctor profile, the current doctor's consultation counts, and the next 3 available schedule slots.
- Admin dashboard shows aggregate counts only, including audit log count without audit log details.

Deferred:

- No doctor directory was implemented.
- No booking was implemented.
- No chat was implemented.
- No uploads were implemented.
- No Supabase Realtime was implemented.
- No Supabase Storage was implemented.
- No 2FA was implemented.
- No admin management actions were implemented.

Validation:

- `npm.cmd run lint` passed.
- `npm.cmd run typecheck` passed.
- `npm.cmd run build` passed.
- `npx.cmd prisma validate` passed.

Smoke test:

- Browser automation and mobile visual verification were blocked by the local Windows sandbox/browser automation issue.
- Safe local HTTP smoke testing passed for logged-out redirects, patient/doctor/admin login redirects, own-dashboard access, wrong-role redirects, and logout.

### Phase 4B: Doctor Directory

Status: Completed

Completed:

- Added a server-rendered patient-only doctor directory at `/patient/doctors`.
- Added a safe patient doctor profile placeholder route at `/patient/doctors/[doctorId]`.
- Updated changed files:
  - `app/patient/doctors/page.tsx`
  - `app/patient/doctors/[doctorId]/page.tsx`
- The doctor directory uses server-side Prisma reads under the existing protected patient workspace layout.
- The directory shows safe doctor fields only:
  - name
  - title
  - specialty
  - short bio
  - education
  - experience
  - availability
- Search by doctor name works through the `q` URL param.
- Specialty filtering works through the `specialty` URL param.
- Clear filters and empty states were added.
- `View profile` links to `/patient/doctors/[doctorId]`.
- The doctor profile route is only a safe placeholder and does not implement booking or consultation creation.

Deferred:

- No booking was implemented.
- No consultation creation was implemented.
- No schedule selection was implemented.
- No chat was implemented.
- No uploads were implemented.
- No Supabase Realtime was implemented.
- No Supabase Storage was implemented.
- No 2FA was implemented.
- No admin management was implemented.

Validation:

- `npm.cmd run lint` passed.
- `npm.cmd run typecheck` passed.
- `npm.cmd run build` passed.
- `npx.cmd prisma validate` passed.

Smoke test:

- Patient can open `/patient/doctors`.
- Seeded doctor appears.
- Doctor name search works.
- Specialty filtering works.
- Combined search and specialty filtering works.
- Clear filters and empty state work.
- `View profile` route opens.
- Doctor and admin users are redirected away from `/patient/doctors`.
- Mobile browser visual check was not completed because browser automation is unavailable.

### Phase 4C: Doctor Profile Details

Status: Completed

Completed:

- Improved the patient-only doctor profile detail page at `/patient/doctors/[doctorId]`.
- Updated changed file:
  - `app/patient/doctors/[doctorId]/page.tsx`
- The page remains server-rendered and patient-only through the existing patient workspace layout.
- The page loads active `DOCTOR` profiles by `DoctorProfile.id`.
- The page includes linked `User` and `Specialty` data.
- The page displays safe doctor fields only:
  - name
  - title
  - specialty
  - bio
  - education
  - experience years
  - availability status
- The page shows up to 3 future `AVAILABLE` schedule slots with exact date, start time, and end time.
- The schedule preview is read-only.
- `notFound()` is used for missing, inactive, or non-doctor records.
- A clear note explains that booking will be implemented later.

Deferred:

- No booking was implemented.
- No consultation creation was implemented.
- No schedule selection was implemented.
- No chat was implemented.
- No uploads were implemented.
- No Supabase Realtime was implemented.
- No Supabase Storage was implemented.
- No 2FA was implemented.
- No admin management was implemented.

Validation:

- `npm.cmd run lint` passed.
- `npm.cmd run typecheck` passed.
- `npm.cmd run build` passed.
- `npx.cmd prisma validate` passed.

Smoke test:

- Patient login, `/patient/doctors`, profile navigation, profile details rendering, read-only schedule preview, booking-later notice, invalid doctor safe not-found behavior, doctor/admin redirects away from patient routes, and logged-out redirect to `/login` were checked with local HTTP smoke tests.
- No credentials, cookies, session tokens, password hashes, environment values, or database URLs should be printed in smoke-test output.
- Browser/mobile visual verification could not run because the in-app browser runtime failed in the Windows sandbox.

Security note:

- Development seed password literals were accidentally exposed during Phase 4C smoke-test setup and must not be printed again.
- Development seed credentials are development-only and must never be used in production.

### Phase 5A: Consultation Booking

Status: Completed

Completed:

- Added first-version patient consultation booking.
- Updated changed files:
  - `app/api/consultations/route.ts`
  - `app/patient/doctors/[doctorId]/page.tsx`
  - `app/patient/consultations/page.tsx`
  - `app/patient/consultations/[consultationId]/page.tsx`
  - `components/patient/booking-form.tsx`
- Patients can book a future `AVAILABLE` doctor schedule slot from the doctor profile page.
- Booking creates a `SCHEDULED` `Consultation`.
- Booking changes the selected `DoctorScheduleSlot` from `AVAILABLE` to `BOOKED`.
- Booking uses a Prisma transaction.
- Double-booking is handled with a conditional slot update and safe `409 Conflict` responses.
- Successful booking redirects to `/patient/consultations/[consultationId]`.
- `/patient/consultations` lists the current patient's consultations.
- `/patient/consultations/[consultationId]` shows a safe consultation summary.

Deferred:

- No chat was implemented.
- No messages were implemented.
- No uploads were implemented.
- No Supabase Realtime was implemented.
- No Supabase Storage was implemented.
- No video calls were implemented.
- No payment was implemented.
- No doctor schedule management was implemented.
- No admin management was implemented.

Validation:

- `npm.cmd run lint` passed.
- `npm.cmd run typecheck` passed.
- `npm.cmd run build` passed.
- `npx.cmd prisma validate` passed.

Smoke test:

- Patient login, doctor profile booking options, successful slot booking, redirect to consultation detail, `SCHEDULED` consultation summary, booked slot removal from available profile slots, consultation list visibility, repeat booking safe `409`, doctor/admin forbidden API attempts, and logged-out unauthorized API attempts were checked with local HTTP smoke tests.
- Smoke-test output did not print credentials, cookies, session tokens, password hashes, environment values, database URLs, or development seed password literals.
- One development slot was booked during smoke testing.

### Phase 5B: Doctor Consultations View

Status: Completed

Completed:

- Added read-only doctor consultation list and detail views.
- Updated changed files:
  - `app/doctor/consultations/page.tsx`
  - `app/doctor/consultations/[consultationId]/page.tsx`
- `/doctor/consultations` lists all consultations assigned to the current doctor, sorted by `scheduledAt` ascending.
- `/doctor/consultations/[consultationId]` shows a read-only safe consultation summary only when the consultation belongs to the current doctor.
- Safe fields shown:
  - patient name
  - date of birth
  - gender
  - scheduled time
  - consultation status
  - slot status
  - doctor specialty

Deferred:

- No chat was implemented.
- No messages were implemented.
- No uploads were implemented.
- No Supabase Realtime was implemented.
- No Supabase Storage was implemented.
- No video calls were implemented.
- No diagnosis was implemented.
- No prescriptions were implemented.
- No medical notes were implemented.
- No status changes were implemented.
- No admin management was implemented.

Validation:

- `npm.cmd run lint` passed.
- `npm.cmd run typecheck` passed.
- `npm.cmd run build` passed.
- `npx.cmd prisma validate` passed.

Smoke test:

- Doctor login, `/doctor/consultations`, assigned consultation list rendering, consultation detail rendering, safe summary fields, fake consultation safe not-found behavior, patient/admin redirects away from doctor routes, and logged-out redirect to `/login` were checked with local HTTP smoke tests.
- Smoke-test output did not print credentials, cookies, session tokens, password hashes, environment values, database URLs, or development seed password literals.

### Phase 5C: Consultation Detail Shells And Chat Preparation

Status: Completed

Completed:

- Improved patient and doctor consultation detail shells.
- Updated changed files:
  - `app/patient/consultations/[consultationId]/page.tsx`
  - `app/doctor/consultations/[consultationId]/page.tsx`
  - `components/consultations/consultation-display.tsx`
- Patient and doctor consultation detail pages now use stacked mobile layout and two-column desktop layout.
- Both pages remain server-rendered and keep server-side ownership checks.
- Missing, fake, or unowned consultations use safe `notFound()` behavior.
- Static read-only placeholders were added for future chat and file attachments.

Deferred:

- No messages were implemented.
- No message composer was implemented.
- No send button was implemented.
- No upload controls were implemented.
- No Supabase Realtime was implemented.
- No Supabase Storage was implemented.
- No video calls were implemented.
- No diagnosis was implemented.
- No prescriptions were implemented.
- No medical notes were implemented.
- No status changes were implemented.

Validation:

- `npm.cmd run lint` passed.
- `npm.cmd run typecheck` passed.
- `npm.cmd run build` passed.
- `npx.cmd prisma validate` passed.

Smoke test:

- Patient and doctor consultation detail rendering, safe summary fields, static chat placeholder, static files placeholder, fake consultation safe not-found behavior, and protected-route redirects were checked with local HTTP smoke tests.
- Smoke-test output did not print credentials, cookies, session tokens, password hashes, environment values, database URLs, or development seed password literals.

### Phase 6A: Chat Message Persistence

Status: Completed

Completed:

- Added first-version text chat persistence using PostgreSQL and Prisma.
- Updated changed files:
  - `app/api/messages/route.ts`
  - `app/patient/consultations/[consultationId]/page.tsx`
  - `app/doctor/consultations/[consultationId]/page.tsx`
  - `components/consultations/consultation-display.tsx`
  - `components/consultations/message-form.tsx`
- `POST /api/messages` creates `MessageType.TEXT` messages.
- Message reads are server-rendered in patient and doctor consultation detail pages.
- Patient and doctor ownership checks are enforced server-side before message reads and writes.
- Message text is trimmed and limited to 2000 characters.
- Sending a message refreshes the current page.
- `GET /api/messages` remains non-implemented.

Deferred:

- No Supabase Realtime was implemented.
- No WebSockets were implemented.
- No uploads were implemented.
- No Supabase Storage was implemented.
- No video calls were implemented.
- No diagnosis was implemented.
- No prescriptions were implemented.
- No medical notes were implemented.
- No status changes were implemented.

Validation:

- `npm.cmd run lint` passed.
- `npm.cmd run typecheck` passed.
- `npm.cmd run build` passed.
- `npx.cmd prisma validate` passed.

Smoke test:

- Full browser/login smoke testing was not completed because temporary dev server startup timed out.
- No credentials, cookies, tokens, environment values, or development seed password literals were printed.

### Phase 6B: Safe Realtime Chat Planning

Status: Completed

Completed:

- Added polling-based chat auto-refresh.
- Updated changed files:
  - `components/consultations/message-refresh.tsx`
  - `components/consultations/consultation-display.tsx`
- `MessageRefresh` calls `router.refresh()` every 5 seconds only when `document.visibilityState === "visible"`.
- Timers and visibility listeners are cleaned up on unmount.
- Message reads remain server-rendered through the existing patient and doctor consultation detail pages.
- Existing Prisma ownership checks remain the authorization boundary.
- True Supabase Realtime remains deferred.

Deferred:

- No `@supabase/supabase-js` dependency was added.
- No Supabase dashboard changes were made.
- No environment changes were made.
- No schema changes were made.
- No migrations were run.
- No API changes were made.
- No Supabase Realtime was implemented.
- No WebSockets were implemented.
- No Broadcast/private channels were implemented.
- No Supabase Storage was implemented.
- No uploads were implemented.
- No service-role usage was added.

Validation:

- `npm.cmd run lint` passed.
- `npm.cmd run typecheck` passed.
- `npm.cmd run build` passed.
- `npx.cmd prisma validate` passed.

Smoke test:

- Codex browser/runtime smoke testing was not completed because temporary dev server startup timed out again in the Windows sandbox.
- The user manually verified in the browser that messages are sent and displayed successfully.
- No secrets, credentials, tokens, cookies, environment values, or development seed password literals were printed.

### Phase 7A: Doctor Schedule Management

Status: Completed

Completed:

- Doctor schedule management uses a 30-minute minimum lead time for schedule slot creation and patient booking.
- Doctors cannot create schedule slots that start less than 30 minutes from now.
- Patients cannot book schedule slots that start less than 30 minutes from now.
- Patient-facing doctor profiles show only bookable `AVAILABLE` slots that start at least 30 minutes from now.
- Expired `AVAILABLE` slots are hidden from patient booking and rejected by the booking API, but are not auto-cleaned in this phase.
- Doctors can cancel only future `AVAILABLE` slots by soft-updating them to `CANCELLED`.
- `BOOKED` slots cannot be cancelled or deleted in this phase.
- No `EXPIRED` status was added.
- No old schedule records are changed automatically.
- No Prisma schema changes, migrations, or dependency changes were made.

Validation:

- `npm.cmd run lint` passed.
- `npm.cmd run typecheck` passed.
- `npm.cmd run build` passed.
- `npx.cmd prisma validate` passed.

### Phase 7B: End-to-End MVP QA And Workflow Polish

Status: Completed

Completed:

- Performed a code-level QA pass over the doctor schedule, patient booking, patient consultation, doctor consultation, and text chat workflow.
- Confirmed by inspection that doctor schedule creation enforces doctor-only access, future starts, 30-minute lead time, 15-minute minimum duration, 4-hour maximum duration, and same-doctor overlap checks against `AVAILABLE`, `BOOKED`, and `BLOCKED` slots.
- Confirmed by inspection that future `AVAILABLE` doctor slots at least 30 minutes away are shown to patients and that past or too-soon `AVAILABLE` slots are hidden from patient booking.
- Confirmed by inspection that patient booking uses a Prisma transaction, conditionally changes slots from `AVAILABLE` to `BOOKED`, rejects too-soon or unavailable slots, and creates scheduled consultations for the current patient only.
- Confirmed by inspection that patient and doctor consultation pages remain server-rendered and scoped to the current patient or assigned doctor.
- Confirmed by inspection that message creation stays patient/doctor only, uses server-side consultation ownership checks, and excludes admin chat access.
- Updated stale workspace and consultation copy now that schedule management, booking, and text chat persistence are available.

Changed files:

- `TASKS.md`
- `PLANS.md`
- `app/doctor/dashboard/page.tsx`
- `app/doctor/schedule/page.tsx`
- `app/doctor/consultations/page.tsx`
- `app/patient/consultations/page.tsx`

Smoke test limitations:

- Authenticated browser workflow testing was not completed in Codex because the Windows sandbox blocked normal process startup and previous temporary dev server attempts timed out.
- No credentials, passwords, password hashes, cookies, session tokens, environment values, database URLs, or development seed password literals were printed.

Validation:

- `npm.cmd run lint` passed.
- `npm.cmd run typecheck` passed.
- `npm.cmd run build` passed.
- `npx.cmd prisma validate` passed.

### Phase 8A: Consultation Completion And Doctor Summary

Status: Completed

Completed:

- Added first-version doctor-only consultation completion.
- Added `POST /api/consultations/[consultationId]/complete`.
- Completion is scoped by consultation id and the assigned doctor's `doctor.userId`.
- Completion is allowed from `SCHEDULED` and `IN_PROGRESS`.
- Already `COMPLETED` consultations and `CANCELLED` consultations return safe `409` responses.
- Completion stores the trimmed plain-text doctor summary in existing `Consultation.doctorNotes`.
- Completion sets `Consultation.status` to `COMPLETED`.
- Completion sets `Consultation.completedAt`.
- Patient consultation detail shows a read-only `Doctor summary` after completion.
- Doctor consultation detail shows the completion form before completion and a read-only completed summary after completion.
- Chat behavior was not changed.
- Chat history remains visible after completion.
- No Prisma schema changes or migrations were needed.

Changed files:

- `app/api/consultations/[consultationId]/complete/route.ts`
- `components/consultations/consultation-completion-form.tsx`
- `components/consultations/consultation-display.tsx`
- `app/doctor/consultations/[consultationId]/page.tsx`
- `app/patient/consultations/[consultationId]/page.tsx`

Deferred:

- Legal prescription workflow.
- Structured diagnosis, recommendation, prescription, and follow-up fields.
- File uploads, Supabase Storage, true Supabase Realtime, video calls, payment, admin management, admin message access, and time-based chat restrictions.

Validation:

- `npm.cmd run lint` passed.
- `npm.cmd run typecheck` passed.
- `npm.cmd run build` passed.
- `npx.cmd prisma validate` passed after `DATABASE_URL` was loaded silently into the process from `.env.local`; the first plain run could not resolve the environment variable.

Smoke test:

- Full authenticated browser/API smoke testing was not completed because the temporary-record harness failed before producing useful diagnostics.
- Limited route smoke passed: unauthenticated completion API requests return `401`, and the new completion route is served by Next.js.
- No credentials, passwords, password hashes, cookies, session tokens, environment values, database URLs, service role keys, or development seed password literals were printed.

### Phase 8B: Consultation History And Archive Rules

Status: Completed

Completed:

- Added URL-backed consultation list filters for patient and doctor consultation pages.
- Supported `filter=upcoming`, `filter=completed`, and `filter=all`.
- Invalid or missing filters fall back to `upcoming`.
- `Upcoming` includes `REQUESTED`, `SCHEDULED`, and `IN_PROGRESS`.
- `Completed` includes `COMPLETED`.
- `All` includes all consultation statuses, including `CANCELLED`.
- Completed consultations remain visible and accessible.
- Consultation records and message records are not deleted.
- Completed consultation detail pages keep chat history visible.
- Completed consultations replace the message composer with a read-only notice.
- `POST /api/messages` returns a safe `409` for completed consultations.
- Non-completed chat behavior is unchanged.

Changed files:

- `app/patient/consultations/page.tsx`
- `app/doctor/consultations/page.tsx`
- `app/patient/consultations/[consultationId]/page.tsx`
- `app/doctor/consultations/[consultationId]/page.tsx`
- `components/consultations/consultation-display.tsx`
- `app/api/messages/route.ts`

Deferred:

- Separate archive tables.
- Hard deletion of consultations or messages.
- File uploads, Supabase Storage, true Supabase Realtime, video calls, payment, legal prescription workflow, structured diagnosis fields, admin message access, and admin management.

Validation:

- `npm.cmd run lint` passed.
- `npm.cmd run typecheck` passed.
- `npm.cmd run build` passed.
- `npx.cmd prisma validate` passed after `DATABASE_URL` was loaded silently into the process from `.env.local`.

Smoke test:

- Automated smoke testing failed because the temporary-record script had a PowerShell parser error and the dev server did not become ready within the timeout for the limited route smoke.
- No credentials, cookies, tokens, passwords, password hashes, database URLs, environment values, service role keys, or development seed password literals were printed.

### Phase 9B: File Attachments Implementation

Status: Completed

Completed:

- Added first-version secure consultation file attachments.
- Added `@supabase/supabase-js` and used it only from a server-only Supabase Storage helper.
- Uploads use the private Supabase Storage bucket `consultation-attachments`.
- Upload and download are server-mediated through Next.js route handlers.
- Prisma/PostgreSQL remains the authorization source of truth.
- Supabase Storage stores file bytes only.
- Attachment metadata is stored in PostgreSQL using the existing `Attachment` model.
- File messages use the existing `MessageType.FILE`.
- `storagePath` is used only server-side and is never shown in the UI.
- Maximum file size is 10 MB.
- Allowed file types are PDF, JPG/JPEG, PNG, and DOCX.
- Completed consultations remain read-only for uploads.
- Admin has no attachment content access in this phase.
- `FILE_UPLOADED` audit logs are created with safe metadata only: consultation id, file size, and file type.
- Patient and doctor consultation detail pages render `MessageType.FILE` safely with filename, type, size, uploader, timestamp, and authorized download links.

Changed files:

- `package.json`
- `package-lock.json`
- `lib/supabase/storage.ts`
- `lib/attachments/validation.ts`
- `app/api/files/route.ts`
- `app/api/files/[attachmentId]/route.ts`
- `components/consultations/attachment-form.tsx`
- `app/patient/consultations/[consultationId]/page.tsx`
- `app/doctor/consultations/[consultationId]/page.tsx`
- `components/consultations/consultation-display.tsx`

Deferred:

- True Supabase Realtime.
- Video calls.
- Legal prescription workflow.
- Admin attachment/message content access.
- Virus scanning.
- Advanced file previews.
- Production file-handling hardening.

Validation:

- `npm.cmd run lint` passed.
- `npm.cmd run typecheck` passed.
- `npm.cmd run build` passed.
- `npx.cmd prisma validate` passed after `DATABASE_URL` was loaded silently into the process from `.env.local`.

Dependency/audit note:

- `npm install @supabase/supabase-js` reported 5 moderate audit findings.
- `npm audit fix` was not run because dependency updates and audit fixes were outside the approved Phase 9B scope.

Smoke test:

- Automated local HTTP smoke testing did not complete because temporary dev-server startup timed out in the Windows environment.
- Manual browser QA later passed for secure consultation file attachments.
- The temporary dev-server process tree was stopped after the timeout.
- No credentials, cookies, tokens, passwords, password hashes, database URLs, service role keys, environment values, or development seed password literals were printed.

Manual QA:

- Patient upload/download works for allowed attachment files.
- Assigned doctor can see and download a patient file.
- Completed consultation is read-only for uploads.
- Logged-out download is rejected.
- Admin download is rejected.
- Other patient download is rejected.
- Download links use `/api/files/[attachmentId]`, not direct Supabase Storage URLs.
- `storagePath` is not visible in the UI or Network responses.
- No Supabase Storage public URL is exposed.
- No secrets were visible in the browser.

### Phase 10A: Admin Doctor Management MVP

Status: Completed

Completed:

- Added first-version admin doctor management.
- Public registration remains patient-only; doctors cannot self-register publicly.
- Admins can create `DOCTOR` users and linked `DoctorProfile` records.
- Admins can select an existing active `Specialty` during doctor creation and editing.
- Temporary passwords are hashed with `hashPassword()` and are not returned, printed, audited, or stored as plaintext.
- Admins can edit basic doctor profile fields: name, email, title, specialty, bio, education, and experience years.
- `User.isActive` controls doctor account access.
- `DoctorProfile.isAvailable` controls patient-facing booking visibility.
- Inactive or unavailable doctors are hidden from the patient doctor directory and patient booking views.
- The booking API rejects inactive or unavailable doctor slot booking.
- Safe audit logs are created for doctor create/update/deactivation with safe identifiers and changed field names only.

Changed files:

- `app/admin/doctors/page.tsx`
- `app/admin/doctors/new/page.tsx`
- `app/admin/doctors/[doctorId]/page.tsx`
- `components/admin/doctor-form.tsx`
- `app/api/admin/doctors/route.ts`
- `app/api/admin/doctors/[doctorId]/route.ts`
- `app/api/consultations/route.ts`
- `app/patient/doctors/page.tsx`
- `app/patient/doctors/[doctorId]/page.tsx`
- `app/admin/dashboard/page.tsx`

Not implemented:

- No Prisma schema changes.
- No migrations.
- No dependencies.
- No email invite flow.
- No password reset.
- No forced password change.
- No 2FA.
- No specialty CRUD.
- No admin schedule management.
- No admin chat/message/file access.
- No hard deletion.
- No billing/payment.

Validation:

- `npm.cmd run lint` passed.
- `npm.cmd run typecheck` passed.
- `npm.cmd run build` passed.
- `npx.cmd prisma validate` passed after `DATABASE_URL` was loaded privately into the process from `.env.local`.

Smoke test:

- Admin doctor list opens.
- Admin can create a doctor.
- Created user has role `DOCTOR` and a linked `DoctorProfile`.
- Password is hashed and not shown after submit.
- Duplicate email and invalid specialty return safe errors.
- Admin can edit and deactivate a doctor.
- Inactive and unavailable doctors disappear from the patient directory.
- Booking API rejects inactive or unavailable doctor slot booking.
- New active and available doctor can log in with the temporary password.
- Admin API auth checks return `401` when logged out and `403` for patient/doctor users.
- Raw App Router page fetches return redirect markers for wrong-role/logged-out access, consistent with prior project notes.
- Temporary smoke doctor was left deactivated and unavailable; no hard delete was performed.
- No credentials, passwords, password hashes, cookies, session tokens, database URLs, service role keys, environment values, or development seed password literals were printed.

### Phase 10B: Admin Specialty Management MVP

Status: Completed

Completed:

- Added first-version admin specialty management.
- Admins can list, create, edit, deactivate, and reactivate specialties.
- `Specialty.isActive` controls whether specialties appear in doctor creation and patient filters.
- Existing doctors linked to inactive specialties remain intact.
- Doctors linked to inactive specialties may remain visible to patients if the doctor account is active and `DoctorProfile.isAvailable` is true.
- Doctor edit can retain the current inactive specialty.
- Doctor edit rejects assigning a different inactive specialty.
- Patient filter options show only active specialties.
- Safe audit logs are created for specialty create/update/deactivation/reactivation with safe identifiers and changed field names only.

Changed files:

- `app/admin/specialties/page.tsx`
- `app/admin/specialties/new/page.tsx`
- `app/admin/specialties/[specialtyId]/page.tsx`
- `components/admin/specialty-form.tsx`
- `app/api/admin/specialties/route.ts`
- `app/api/admin/specialties/[specialtyId]/route.ts`
- `app/admin/dashboard/page.tsx`
- `app/admin/doctors/[doctorId]/page.tsx`
- `app/api/admin/doctors/[doctorId]/route.ts`

Not implemented:

- No Prisma schema changes.
- No migrations.
- No dependencies.
- No hard deletion.
- No admin chat/message/file access.
- No admin schedule management.
- No billing/payment.
- No invite flow.
- No password reset.
- No 2FA.

Validation:

- `npm.cmd run lint` passed.
- `npm.cmd run typecheck` passed.
- `npm.cmd run build` passed.
- `npx.cmd prisma validate` passed after `DATABASE_URL` was loaded privately into the process from `.env.local`.

Smoke test:

- Admin can open specialty list.
- Admin can create a specialty.
- Duplicate name/slug return safe errors.
- Invalid slug returns safe error.
- Admin can edit, deactivate, and reactivate specialty.
- Deactivated specialty remains linked to existing doctors.
- Doctor creation only lists active specialties.
- Doctor edit can retain current inactive specialty.
- Doctor edit rejects assigning a different inactive specialty.
- Patient filter only lists active specialties.
- Doctor linked to inactive specialty remains visible when active/available.
- Admin specialty APIs return `401` when logged out and `403` for patient/doctor users.
- Raw App Router page fetches return redirect markers for logged-out/wrong-role access, consistent with prior project notes.
- No private internals appeared in new admin specialty pages.
- Temporary smoke records were left non-public/inactive where applicable; no hard delete was performed.
- No credentials, passwords, password hashes, cookies, session tokens, database URLs, service role keys, environment values, or development seed password literals were printed.

### Phase 10C: MVP UI Copy And Workflow Polish

Status: Completed

Completed:

- Removed stale login copy saying registration is unavailable or patient registration will be added later.
- Added a login link to patient-only public registration.
- Removed development account email hints from the login UI.
- Replaced login role-workspace cards with concise product copy.
- Updated patient dashboard copy to reflect completed booking, consultation history, chat, file attachment, and doctor discovery workflows.
- Updated patient doctor directory and doctor detail copy to reflect available booking, chat, and secure file attachments.
- Kept public registration patient-only and did not add doctor or admin registration links.

Changed files:

- `app/(auth)/login/page.tsx`
- `components/auth/login-form.tsx`
- `app/patient/dashboard/page.tsx`
- `app/patient/doctors/page.tsx`
- `app/patient/doctors/[doctorId]/page.tsx`
- `TASKS.md`
- `PLANS.md`
- `CURRENT_STATE.md`
- `SECURITY.md`

Not implemented:

- No product functionality changes.
- No Prisma schema changes.
- No migrations.
- No dependencies.
- No route, authorization, booking, chat, attachment, or admin behavior changes.

### Phase 11A: Access Token Schema And Backend Foundation

Status: Completed

Completed:

- Added the shared token foundation for future doctor invite and password reset flows.
- Added `AccountAccessTokenType` with `DOCTOR_INVITE` and `PASSWORD_RESET`.
- Added `AccountAccessToken` records linked to users, optional creator users, token type, token hash, expiration, use time, and creation time.
- Added `User.passwordChangedAt` for future account access hardening.
- Added audit actions for doctor invite creation, password set, password reset creation, and password reset completion.
- Added server-only helper functions to generate 32-byte secure random raw tokens, hash tokens with SHA-256, create token records, find valid unused unexpired tokens, and mark tokens used.
- Created and applied Prisma migration `20260528233106_add_account_access_tokens`.

Changed files:

- `prisma/schema.prisma`
- `prisma/migrations/20260528233106_add_account_access_tokens/migration.sql`
- `lib/auth/access-tokens.ts`
- `TASKS.md`
- `PLANS.md`
- `CURRENT_STATE.md`
- `SECURITY.md`
- `DECISIONS.md`

Security notes:

- Raw invite/reset tokens are intended to be shown only once in future phases and are never stored.
- Only SHA-256 token hashes are stored.
- Tokens are designed for one-time use and expiration.
- Token helpers are server-only and do not expose tokens to client components.
- Public registration remains patient-only.

Not implemented:

- No doctor invite UI.
- No admin generate-invite action.
- No doctor set-password page.
- No forgot-password or reset-password pages.
- No email provider or email templates.
- No 2FA.
- No doctor self-registration or public role selector.
- No change to current admin temporary-password doctor creation behavior.

### Phase 11B: Admin Doctor Invite MVP

Status: Completed

Completed:

- Added the Admin Doctor Invite MVP using the Phase 11A account access token foundation.
- Admin doctor creation now defaults to invite mode.
- Temporary-password doctor creation remains available as a fallback.
- Invite-created doctors start with `User.isActive=false` and `DoctorProfile.isAvailable=false`.
- Successful `/set-password` activates `User.isActive` and keeps `DoctorProfile.isAvailable=false` until an admin enables booking availability.
- Invite links are shown once in the admin UI immediately after invite creation or regeneration.
- Doctor invite links are now restricted to onboarding-only accounts.
- Invite generation is allowed only when `User.passwordChangedAt` is null and `User.isActive` is false.
- Completed/setup doctors must use password reset instead of invite.
- `POST /api/admin/doctors/[doctorId]/invite` enforces the onboarding-only rule server-side; UI-only hiding is not the only protection.
- Completed/setup doctor invite attempts return a safe `409` and do not generate a new invite token.
- The invite endpoint invalidates unused, unexpired invite tokens for that doctor before returning `409`.
- Raw invite tokens are never stored, logged, audited, printed, or re-displayed.
- Only SHA-256 token hashes are stored.
- Doctor invite tokens expire after 7 days and are one-time-use.
- Prior unused doctor invite tokens are invalidated when an admin regenerates an invite.
- Existing doctor sessions are revoked after password setup.
- Public registration remains patient-only, and doctors still cannot self-register publicly.
- Invite-mode doctor creation previously returned a `500`; the root cause was fixed before commit.
- Duplicate email now returns safe validation instead of a generic failure.
- Invite-mode doctor creation now works with a unique email and active specialty.

Changed files:

- `app/(auth)/login/page.tsx`
- `app/(auth)/set-password/page.tsx`
- `app/admin/doctors/[doctorId]/page.tsx`
- `app/admin/doctors/new/page.tsx`
- `app/api/admin/doctors/route.ts`
- `app/api/admin/doctors/[doctorId]/invite/route.ts`
- `app/api/auth/set-password/route.ts`
- `components/admin/doctor-form.tsx`
- `components/admin/doctor-invite-action.tsx`
- `components/auth/set-password-form.tsx`
- `lib/auth/session.ts`
- `lib/prisma.ts`
- `TASKS.md`
- `PLANS.md`
- `CURRENT_STATE.md`
- `SECURITY.md`

Not implemented:

- No email provider.
- No public forgot-password flow.
- No password reset flow.
- No 2FA.
- No doctor self-registration.
- No public role selector.
- No removal of temporary-password fallback.
- No Prisma schema changes.
- No migrations.
- No dependencies.
- No email provider.
- No public forgot-password flow.
- No 2FA.

Validation:

- `npx.cmd prisma validate` passed after `DATABASE_URL` was loaded privately into the process from `.env.local`.
- `npm.cmd run lint` passed.
- `npm.cmd run typecheck` passed.
- `npm.cmd run build` passed.

Manual QA:

- Admin created a doctor using invite mode with a unique email.
- Invite-created doctor starts inactive and unavailable for booking.
- Invite link was shown once in the admin UI.
- Doctor opened `/set-password` with the invite link and set a password successfully.
- Doctor was redirected to login and could sign in with the new password.
- Reusing the invite link shows a generic invalid, expired, or used state.
- Temporary-password doctor creation remains available as fallback.
- Public `/register` remains patient-only.
- `DoctorProfile.isAvailable` remains false until admin enables booking.
- No invite link or raw token was exposed in chat.

Security notes:

- The invite-mode `500` was caused by a stale cached Prisma client in the running development server after the Phase 11A generated client changed. `lib/prisma.ts` now discards an incompatible cached Prisma client when the expected account access token delegate is missing.
- No raw invite tokens, invite URLs containing tokens, token hashes, password hashes, cookies, session tokens, environment values, service role keys, or development seed password literals were printed.

### Phase 11C: Admin-Generated Doctor Password Reset Links

Status: Completed

Completed:

- Added admin-generated password reset links for existing doctor accounts.
- Added `POST /api/admin/doctors/[doctorId]/password-reset` with server-side `ADMIN` role checks.
- Password reset generation works only for existing `DOCTOR` users with linked doctor profiles.
- Reset links are shown once in the admin UI immediately after generation.
- Raw reset tokens are never stored, logged, audited, printed, or re-displayed.
- Only SHA-256 token hashes are stored.
- Password reset tokens expire after 1 hour and are one-time-use.
- Regenerating a reset link invalidates prior unused, unexpired `PASSWORD_RESET` tokens for that doctor.
- Added public `/reset-password?token=...` and `POST /api/auth/reset-password`.
- Reset password validates a `PASSWORD_RESET` token, requires the linked user role to be `DOCTOR`, hashes the new password with `hashPassword()`, sets `User.passwordChangedAt`, marks the token used, and revokes existing doctor sessions.
- Password reset preserves the existing `User.isActive` value.
- Password reset preserves the existing `DoctorProfile.isAvailable` value.
- Password reset does not auto-login the doctor.
- Existing invite flow continues to work.
- Existing temporary-password doctor creation remains available as fallback.
- Public `/register` remains patient-only.

Changed files:

- `app/(auth)/login/page.tsx`
- `app/(auth)/reset-password/page.tsx`
- `app/admin/doctors/[doctorId]/page.tsx`
- `app/api/admin/doctors/[doctorId]/password-reset/route.ts`
- `app/api/auth/reset-password/route.ts`
- `components/admin/doctor-invite-action.tsx`
- `components/admin/doctor-password-reset-action.tsx`
- `components/auth/reset-password-form.tsx`
- `TASKS.md`
- `PLANS.md`
- `CURRENT_STATE.md`
- `SECURITY.md`

Not implemented:

- No public forgot-password flow.
- No patient self-service reset.
- No email provider or email templates.
- No 2FA.
- No doctor self-registration.
- No public role selector.
- No Prisma schema changes.
- No migrations.
- No dependencies.
- No removal of temporary-password fallback.

Validation:

- `npx.cmd prisma validate` passed after `DATABASE_URL` was loaded privately into the process from `.env.local`.
- `npm.cmd run lint` passed.
- `npm.cmd run typecheck` passed.
- `npm.cmd run build` passed.

Safe checks:

- Public `/register` remains patient-only by inspection.
- Doctor self-registration still does not exist.
- Admin can generate a password reset link for an existing doctor.
- Reset link is shown once in admin UI.
- Reset token expires after 1 hour.
- Reusing a reset link returns a generic invalid or expired state.
- Password reset updates `passwordChangedAt`.
- Password reset marks the token used.
- Password reset revokes existing sessions for that doctor.
- Password reset preserves `User.isActive`.
- Password reset preserves `DoctorProfile.isAvailable`.
- Existing invite flow and temporary-password fallback remain in place.
- No raw reset tokens, reset URLs containing tokens, invite URLs containing tokens, token hashes, password hashes, cookies, session tokens, environment values, service role keys, or development seed password literals were printed.

### Phase 11D: Patient And Doctor Profile Settings MVP

Status: Completed

Completed:

- Replaced patient and doctor profile placeholders with protected profile/settings pages.
- Added `PATCH /api/patient/profile` with server-side `PATIENT` role checks.
- Added `PATCH /api/doctor/profile` with server-side `DOCTOR` role checks.
- Patients can view email, name, date of birth, gender, role, and account status.
- Patients can edit only safe personal profile fields: name, date of birth, and gender.
- Doctors can view email, name, title, specialty, bio, education, experience years, account active status, and booking availability status.
- Doctors can edit only limited public profile copy fields: title, bio, and education.
- Email, role, account status, specialty, experience years, and booking availability remain protected/admin-controlled where appropriate.
- Profile update APIs use current-user ownership scoping and narrow Prisma selects.

Changed files:

- `app/patient/profile/page.tsx`
- `app/doctor/profile/page.tsx`
- `app/api/patient/profile/route.ts`
- `app/api/doctor/profile/route.ts`
- `components/patient/patient-profile-form.tsx`
- `components/doctor/doctor-profile-form.tsx`
- `TASKS.md`
- `PLANS.md`
- `CURRENT_STATE.md`
- `SECURITY.md`

Not implemented:

- No Prisma schema changes.
- No migrations.
- No dependencies.
- No email change.
- No password change.
- No public forgot-password.
- No 2FA.
- No invite/reset flow changes.
- No admin profile/settings.

### Phase 11F: Email Provider Foundation

Status: Completed

Completed:

- Selected Resend as the MVP transactional email provider.
- Added server-only direct-fetch email provider helper without installing the Resend SDK.
- Added a server-only password reset email template helper with HTML and plain text output.
- Documented email environment variables in `.env.example`: `EMAIL_PROVIDER`, `RESEND_API_KEY`, `EMAIL_FROM`, `APP_URL`, and optional `EMAIL_REPLY_TO`.
- Kept real secret values restricted to `.env.local` and deployment environment variables.
- Kept public forgot-password and user-facing email sending deferred to Phase 11G.
- Kept admin-generated doctor reset links in place.

Changed files:

- `.env.example`
- `lib/email/resend.ts`
- `lib/email/password-reset-email.ts`
- `TASKS.md`
- `PLANS.md`
- `CURRENT_STATE.md`
- `SECURITY.md`
- `DECISIONS.md`

Not implemented:

- No public forgot-password flow.
- No email sending from user-facing routes.
- No Resend SDK or new npm dependency.
- No Prisma schema changes.
- No migrations.
- No 2FA.
- No email change.

Security notes:

- `RESEND_API_KEY` is server-only and must not use `NEXT_PUBLIC_`.
- Raw reset tokens and reset URLs containing tokens must not be logged.
- Email bodies for password reset messages contain reset URLs and must not be printed.
- Public password reset remains deferred to Phase 11G.

## Phase 5: Admin And Operational Views

Status: In progress

Goals:

- Admin dashboard.
- User management.
- Doctor management.
- Specialty management.
- Consultation list.
- Audit log.

## Phase 6: Quality, SEO, And Deployment Readiness

Status: Not started

Goals:

- Add public-page SEO metadata.
- Add robots and sitemap routes.
- Verify responsive layouts.
- Verify loading, empty, error, unauthorized, forbidden, and not-found states.
- Prepare Vercel deployment configuration and environment variables.
- Verify production build.

## Phase 7: Post-MVP Enhancements

Status: Deferred

Goals:

- TOTP 2FA for doctors and admins.
- Video calls.
- Patient intake questionnaire.
- Consultation archive export.
- AI consultation summary.
- PWA/mobile improvements.

---

# ExecPlan Template

Use this template before large changes.

A plan must be self-contained. A new agent should be able to continue from the plan and the repository without reading prior chat context.

## Plan: [Feature or Change Name]

### Purpose

Explain why this change exists and what user problem it solves.

### Current State

Describe what currently exists and list relevant files.

### Target State

Describe the expected final behavior.

### Non-Goals

List what must not be implemented in this plan.

### Files Likely To Change

List likely files and directories.

### Milestones

- [ ] Milestone 1
- [ ] Milestone 2
- [ ] Milestone 3

### Step-By-Step Implementation

Detailed implementation steps.

### Validation

Commands to run when available:

- `npm run lint`
- `npm run typecheck`
- `npm run build`
- `npx prisma format`
- `npx prisma generate`

Manual checks:

- Describe exact user flow to verify.
- Use Playwright MCP when available for UI flows.

### Risks

List risks and possible regressions.

### Rollback

Explain how to undo the change.

### Progress

Update this section during implementation.

### Decisions

Record decisions made during the task.

### Open Questions

List anything requiring user approval.
