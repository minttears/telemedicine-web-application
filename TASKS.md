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
| T301 | DONE | Build custom session-cookie authentication foundation | Custom session-cookie auth foundation is implemented without Auth.js. |
| T302 | DONE | Implement registration, login, logout | Patient registration, login UI/API, logout API, and protected workspaces are implemented. Public doctor/admin registration is not allowed. |
| T303 | DONE | Implement role-based access helpers | Includes `getCurrentUser`, `requireUser`, `requireRole`, and API response helpers. |
| T304 | DONE | Add role-based redirects | Login redirects by role; protected workspace layouts enforce role access and wrong-role redirects. |
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
| T501 | DONE | Create patient workspace route structure | Patient workspace routes exist with a responsive dashboard shell and navigation. Doctor directory, booking, chat, and file workflows remain TODO. |
| T502 | DONE | Create doctor workspace route structure | Doctor workspace routes exist with a responsive dashboard shell and navigation. Schedule management, consultations, chat, and patient workflows remain TODO. |
| T503 | DONE | Create admin workspace route structure | Admin workspace routes exist with a responsive aggregate dashboard shell and navigation. Admin management actions remain TODO. |
| T504 | DONE | Add responsive layout patterns | Workspace shell and role dashboards use responsive desktop/mobile layout patterns. Further page-specific responsive checks remain part of quality work. |

## Milestone 6: Doctors, Scheduling, And Booking

| ID | Status | Task | Notes |
| --- | --- | --- | --- |
| T601 | TODO | Implement doctor specialty and profile management | Admin creates doctors; doctors edit profile details. |
| T602 | DONE | Implement doctor list and filters | Patient doctor directory supports doctor name search and specialty filtering. Availability is shown on cards, but availability filtering remains deferred. |
| T603 | DONE | Implement doctor profile page | Patient-only doctor profile details and a read-only upcoming slot preview are completed. Booking, consultation creation, and schedule selection remain TODO. |
| T604 | TODO | Implement basic schedule slots | Keep scheduling simple for MVP. |
| T605 | DONE | Implement consultation booking | First-version patient booking is completed: selecting a future available slot creates a scheduled consultation and books the slot. Chat, messages, uploads, Realtime, Storage, video calls, payment, doctor schedule management, and admin management remain TODO. |

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
