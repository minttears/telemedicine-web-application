# Plans

## Current Plan

The current phase is post-scaffold planning for Phase 2.

Phase 1 scaffold is completed. Further implementation, commits, pushes, or pull requests should happen only when explicitly approved.

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

## Phase 3: Core MVP Workflows

Status: Not started

Goals:

- Patient registration and profile.
- Doctor list, filters, and profiles.
- Doctor schedule slots.
- Consultation booking.
- Role-specific dashboards.

## Phase 4: Consultation Chat And Files

Status: Not started

Goals:

- Persist messages through backend APIs.
- Add consultation chat UI.
- Add Supabase Realtime subscriptions for UI updates.
- Add Supabase Storage file attachments.
- Store attachment metadata in PostgreSQL.

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
