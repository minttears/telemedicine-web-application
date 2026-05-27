# Plans

## Current Plan

Phase 4A workspace dashboard shells are completed. Further implementation, commits, pushes, or pull requests should happen only when explicitly approved.

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

## Phase 5: Admin And Operational Views

Status: Not started

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
