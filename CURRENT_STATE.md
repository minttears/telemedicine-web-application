# Current State

## Project Goal

Build a Next.js telemedicine MVP where patients register, choose doctors, book consultation slots, and exchange consultation messages with assigned doctors. PostgreSQL through Prisma remains the source of truth.

## Current Stack

- Next.js App Router, React, TypeScript, Node.js runtime
- Tailwind CSS for UI
- Prisma ORM with Supabase Postgres
- Custom session-cookie authentication
- Supabase Realtime and Supabase Storage are planned but not implemented in active workflows
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

## Current MVP Behavior

- Patients can register, log in, browse doctors, open doctor profiles, book future `AVAILABLE` slots at least 30 minutes away, view consultations, send/read text messages, and view a read-only doctor summary after completion.
- Doctors can log in, manage future schedule slots, cancel future `AVAILABLE` slots, view assigned consultations, send/read text messages, and complete assigned `SCHEDULED` or `IN_PROGRESS` consultations with one plain-text conclusion/recommendations summary.
- Booking creates a `SCHEDULED` consultation and changes the selected slot from `AVAILABLE` to `BOOKED` inside a Prisma transaction.
- Patient and doctor consultation reads are server-rendered and scoped by current profile ownership.
- Message creation uses `POST /api/messages`, stores `MessageType.TEXT`, trims body text, and enforces a 2000-character limit.
- Chat auto-refresh uses polling with `router.refresh()` every 5 seconds only while the document is visible.
- Consultation completion uses existing `Consultation.doctorNotes` for the MVP doctor summary, sets `Consultation.status` to `COMPLETED`, and sets `Consultation.completedAt`.
- Chat availability rules were not changed for completed consultations, and chat history remains visible.
- Admin has protected workspace routes but operational management is still mostly placeholder/deferred.

## Deferred Features

- True Supabase Realtime subscriptions and the required custom auth/RLS/JWT security design
- File uploads, attachment metadata flow, and Supabase Storage
- Admin management screens and audit-log workflows
- Admin break-glass/private consultation access
- Doctor profile/specialty management beyond seeded data
- Recurring schedules, booked slot cancellation, consultation cancellation, and status changes
- Legal prescription workflow, structured diagnosis/recommendation/follow-up fields, medical notes, and archives
- Time-based chat restrictions and read-only chat after completion
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

Phase 8A: Consultation Completion And Doctor Summary.

Latest known commit:

- `8f13d6c chore: polish mvp workflow qa`

## Next Recommended Phase

Choose the next MVP gap deliberately. Strong candidates are admin management foundations, file attachment metadata/storage planning, public SEO/deployment readiness, or time-based/read-only chat rules after completion. Supabase Realtime should remain deferred until a separate security plan is approved.
