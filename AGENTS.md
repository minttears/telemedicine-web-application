# AGENTS.md

## Purpose

This file gives Codex and other coding agents project-specific instructions.

Primary source of truth order:

1. `Requirements Specification.md`
2. `PROJECT_BRIEF.md`
3. `DECISIONS.md`
4. `TASKS.md`
5. `SECURITY.md`
6. `PLANS.md`
7. User's latest explicit instruction

If files conflict, stop and ask the user before changing code.

## Current Project State

The repository is at the documentation/bootstrap stage.

Do not implement application code, install dependencies, create commits, push branches, or open pull requests until the user explicitly approves.

## Expected Stack

- Next.js App Router
- React
- TypeScript
- Node.js runtime
- Prisma ORM
- Supabase Postgres
- Supabase Realtime
- Supabase Storage
- Tailwind CSS
- Vercel

Do not add a separate Express backend for the MVP.
Use Next.js Route Handlers for backend endpoints.

Example backend routes:

- `app/api/auth/register/route.ts`
- `app/api/auth/login/route.ts`
- `app/api/auth/logout/route.ts`
- `app/api/consultations/route.ts`
- `app/api/messages/route.ts`
- `app/api/files/route.ts`

## Hard Constraints

- Do not use Auth.js unless the user explicitly asks for it.
- Do not add an Express backend for the MVP.
- Do not use emoji in UI requirements or UI copy.
- Do not commit changes unless the user explicitly confirms.
- Do not push changes unless the user explicitly confirms.
- Do not open pull requests unless the user explicitly confirms.
- Do not add dependencies unless the user approves dependency setup or implementation.
- Do not store real secrets in the repository.
- Do not edit `.env.local` or any file containing real secrets.
- Do not expose `SUPABASE_SERVICE_ROLE_KEY` to client-side code.

## Project Context Rule

Before starting a meaningful task, re-check these files when they exist:

- `Requirements Specification.md`
- `PROJECT_BRIEF.md`
- `TASKS.md`
- `DECISIONS.md`
- `SECURITY.md`
- `PLANS.md`
- `.env.example`

Use them as the source of truth for scope, architecture, security, tasks, and workflow.

## Commands

Use these commands when the project scaffold exists:

- Install dependencies: `npm install`
- Development server: `npm run dev`
- Lint: `npm run lint`
- Typecheck: `npm run typecheck`
- Build: `npm run build`
- Prisma format: `npx prisma format`
- Prisma generate: `npx prisma generate`
- Prisma migrate dev: `npx prisma migrate dev`
- Prisma Studio: `npx prisma studio`

If a command is unavailable, say so and suggest the missing script.

## Backend Architecture

PostgreSQL is the source of truth.

Use Prisma for database reads and writes.
Use Supabase Realtime only for UI updates.
Use Supabase Storage for uploaded file blobs.
Store file metadata in PostgreSQL.

Realtime rule:

- Messages must be created through backend APIs with authorization checks.
- Supabase Realtime may notify the UI about new records.
- Do not rely on client-side Realtime as the security boundary.

## Authentication

Use custom session-cookie authentication when implementation begins.

Expected helpers:

- `getCurrentUser`
- `requireUser`
- `requireRole`

Expected persistence:

- `User`
- `Session`
- future `TwoFactorSecret`
- future `TwoFactorRecoveryCode`

Expected cookie behavior:

- HTTP-only
- Secure in production
- `SameSite=Lax` by default unless requirements change
- Server-side validation of session records
- Session invalidation on logout

2FA should be prepared in the data model but not implemented until a later approved task.

## Authorization Rules

All protected data access must be checked server-side.

- `PATIENT` can access only their own profile, consultations, messages, and files.
- `DOCTOR` can access only assigned consultations, related patients, messages, and files.
- `ADMIN` can manage operational records, but should not read private consultation chat content unless explicitly implemented and audited.

## Data Model Direction

Core MVP models:

- `User`
- `Session`
- `PatientProfile`
- `DoctorProfile`
- `Specialty`
- `DoctorScheduleSlot`
- `Consultation`
- `Message`
- `Attachment`
- `AuditLog`
- `TwoFactorSecret`
- `TwoFactorRecoveryCode`

Message types should allow future expansion:

- `TEXT`
- `FILE`
- `SYSTEM`
- `CALL_STARTED`
- `CALL_ENDED`

Consultation statuses:

- `REQUESTED`
- `SCHEDULED`
- `IN_PROGRESS`
- `COMPLETED`
- `CANCELLED`

## UI Rules

Style direction: light minimalism, clean medical-service interface, calm dashboard UI.

Rules:

- Do not use emoji in the interface.
- Use SVG/vector icons, status badges, illustrations, and text labels instead.
- Prefer clean typography, generous spacing, and consistent components.
- Use calm blue, teal, or green as the primary accent.
- Avoid aggressive colors and excessive animation.
- Use responsive layouts for desktop, tablet, and mobile.
- Include loading, empty, error, unauthorized, forbidden, and not-found states for primary screens.
- Use smooth and restrained animations only when they improve clarity.

Allowed UI tools after dependency approval:

- Tailwind CSS
- `lucide-react` for icons
- Framer Motion only if animation is actually needed

## SEO And Public Pages

Public pages should have SEO metadata:

- `/`
- `/doctors`
- `/doctors/[doctorId]`
- `/about`
- `/contacts`
- `/privacy`
- `/terms`

Use Next.js Metadata API, `app/sitemap.ts`, `app/robots.ts`, and an accurate favicon.

Authenticated dashboards should not be indexed.

## MCP Usage Rules

Use Context7 MCP when available for current documentation about:

- Next.js App Router
- Prisma
- Supabase Postgres
- Supabase Realtime
- Supabase Storage
- Vercel deployment
- Tailwind CSS
- any dependency-specific API that may have changed

Use Playwright MCP when available for:

- UI changes
- routing changes
- auth flow changes
- form behavior
- dashboard behavior
- chat UI behavior
- responsive desktop/mobile checks
- checking browser console errors

If a relevant MCP server is available, prefer using it before making assumptions.
If it is unavailable, state that and continue with best effort.

## Documentation Maintenance

After every meaningful change, decide whether documentation should be updated.

Update candidates:

- `TASKS.md` when a task is completed, added, split, blocked, or reprioritized.
- `DECISIONS.md` when an architectural or product decision is made.
- `PLANS.md` when a large plan changes.
- `SECURITY.md` when security posture, auth, file handling, or access rules change.
- `.env.example` when environment variables are added or changed.

Important:

Do not update these files automatically unless the user has already approved the specific update.
First show the proposed update and ask for confirmation.

## Git And PR Rules

Before suggesting a commit:

1. Run relevant checks when possible.
2. Summarize changed files.
3. Show a short diff summary.
4. Suggest a commit message.
5. Ask whether to commit.

After a meaningful feature, fix, or milestone, suggest opening a pull request, but do not open it without explicit approval.

Never push directly to `main` without explicit approval.

## Done Means

A task is done when:

- The requested behavior is implemented.
- The change is scoped and does not rewrite unrelated files.
- Code is type-safe.
- Relevant validation commands pass or failures are clearly explained.
- Security and role boundaries are preserved.
- Changed files are summarized.
- New follow-up tasks are listed.
- A commit message is suggested when appropriate.
