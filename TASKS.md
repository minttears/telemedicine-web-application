# Tasks

## Status Legend

- `TODO`: Not started
- `IN_PROGRESS`: Being worked on
- `DONE`: Completed
- `BLOCKED`: Waiting on a decision or external dependency
- `DEFERRED`: Intentionally postponed

## Milestone 0: Documentation And Setup Approval

| ID | Status | Task | Notes |
| --- | --- | --- | --- |
| T000 | IN_PROGRESS | Finalize project documentation files | Includes requirements, agent rules, decisions, plans, security, and env example. |
| T001 | TODO | Confirm MCP setup plan | Context7 for docs, Playwright for UI verification. |
| T002 | TODO | Confirm first implementation step | User must explicitly approve moving from documentation to implementation. |

## Milestone 1: Project Scaffold

| ID | Status | Task | Notes |
| --- | --- | --- | --- |
| T101 | DONE | Initialize the Next.js App Router project with TypeScript | Root `app/` scaffold created. |
| T102 | DONE | Add Tailwind CSS setup and base styling conventions | Tailwind and base global styles are configured. |
| T103 | DONE | Add initial folder structure | Public, patient, doctor, admin, API, components, lib, prisma, and public scaffold folders are present. |
| T104 | DONE | Add package scripts | `dev`, `build`, `lint`, `typecheck`, and Prisma scripts are present. |
| T105 | DONE | Add `.env.example` to repository | No real secrets. Existing env example retained. |

## Milestone 2: Database And Prisma

| ID | Status | Task | Notes |
| --- | --- | --- | --- |
| T201 | DONE | Configure Prisma and Supabase Postgres connection | Supabase Postgres connection validated; `DATABASE_URL` and `DIRECT_URL` are configured locally. |
| T202 | DONE | Draft the initial Prisma schema | Includes users, sessions, profiles, specialties, schedule slots, consultations, messages, attachments, audit log, and future 2FA models. |
| T203 | DONE | Add seed data | Development admin, doctor, patient, specialties, profiles, and schedule slots were seeded. |
| T204 | DONE | Validate Prisma setup | Initial migration was created/applied and Prisma validation commands passed. |

## Milestone 3: Authentication And Authorization

| ID | Status | Task | Notes |
| --- | --- | --- | --- |
| T301 | TODO | Build custom session-cookie authentication foundation | Do not use Auth.js. |
| T302 | TODO | Implement registration, login, logout | Patient registration first; doctor/admin through seed or admin later. |
| T303 | TODO | Implement role-based access helpers | Include `getCurrentUser`, `requireUser`, and `requireRole`. |
| T304 | TODO | Add role-based redirects | Patient, doctor, admin dashboards. |
| T305 | TODO | Add basic auth validation states | Loading, error, forbidden, unauthorized. |

## Milestone 4: Public Pages And SEO

| ID | Status | Task | Notes |
| --- | --- | --- | --- |
| T401 | TODO | Create public route structure | `/`, `/doctors`, doctor profile, about, contacts, privacy, terms. |
| T402 | TODO | Add SEO metadata plan | Metadata API, Open Graph, canonical where appropriate. |
| T403 | TODO | Add sitemap and robots routes | Exclude authenticated dashboards. |
| T404 | TODO | Add favicon and app icon | Clean medical/minimal style. |

## Milestone 5: Workspaces And Core UI

| ID | Status | Task | Notes |
| --- | --- | --- | --- |
| T501 | TODO | Create patient workspace route structure | Dashboard, profile, doctors, consultations, chat history, files, archive placeholder. |
| T502 | TODO | Create doctor workspace route structure | Dashboard, profile, schedule, consultations, patients, templates placeholder, security. |
| T503 | TODO | Create admin workspace route structure | Dashboard, users, doctors, specialties, consultations, audit log, settings. |
| T504 | TODO | Add responsive layout patterns | Desktop, tablet, mobile. |

## Milestone 6: Doctors, Scheduling, And Booking

| ID | Status | Task | Notes |
| --- | --- | --- | --- |
| T601 | TODO | Implement doctor specialty and profile management | Admin creates doctors; doctors edit profile details. |
| T602 | TODO | Implement doctor list and filters | Specialty, availability, search, sorting. |
| T603 | TODO | Implement doctor profile page | Includes schedule and booking CTA. |
| T604 | TODO | Implement basic schedule slots | Keep scheduling simple for MVP. |
| T605 | TODO | Implement consultation booking | Selecting a slot creates a consultation and reserves the slot. |

## Milestone 7: Consultation Chat And Files

| ID | Status | Task | Notes |
| --- | --- | --- | --- |
| T701 | TODO | Implement consultation chat persistence | Messages are written and read through backend APIs using Prisma. |
| T702 | TODO | Add Supabase Realtime chat UI updates | PostgreSQL remains the source of truth. |
| T703 | TODO | Implement file attachment metadata and storage flow | Store blobs in Supabase Storage and metadata in PostgreSQL. |
| T704 | TODO | Add future call-ready message types | `CALL_STARTED`, `CALL_ENDED` should be supported in the enum. |

## Milestone 8: Admin And Audit

| ID | Status | Task | Notes |
| --- | --- | --- | --- |
| T801 | TODO | Implement minimal admin management screens | Users, doctors, specialties, consultations, and audit logs. |
| T802 | TODO | Add audit log creation for important actions | Login failure if practical, admin changes, consultation status, file uploads. |

## Milestone 9: Quality And Deployment

| ID | Status | Task | Notes |
| --- | --- | --- | --- |
| T901 | TODO | Add responsive and state coverage checks | Loading, empty, error, unauthorized, forbidden, and not found. |
| T902 | TODO | Add deployment configuration guidance for Vercel | Ensure environment variables are documented. |
| T903 | TODO | Add basic quality gates | Lint, typecheck, build, and Prisma validation scripts when app setup exists. |
| T904 | TODO | Use Playwright MCP to verify key UI flows when available | Login, dashboards, booking, chat. |

## Deferred Features

| ID | Status | Task | Notes |
| --- | --- | --- | --- |
| D001 | DEFERRED | 2FA enforcement for doctors and admins | Prepare models earlier, implement after MVP auth/chat. |
| D002 | DEFERRED | Video calls | Consider Jitsi first, custom WebRTC later only if needed. |
| D003 | DEFERRED | Patient intake questionnaire | Add after core consultation flow works. |
| D004 | DEFERRED | Consultation archive download | Export chat, files, final diagnosis/notes. |
| D005 | DEFERRED | AI consultation summaries | Summary only, not diagnosis. |
| D006 | DEFERRED | PWA and mobile-specific enhancements | Responsive web first. |
