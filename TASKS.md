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
| T306 | DONE | Add account access token, doctor invite, and admin reset flows | Phase 11A added hashed, expiring, one-time token storage and helpers. Phase 11B added the Admin Doctor Invite MVP and doctor set-password flow. Phase 11C added admin-generated doctor password reset links. Phase 11F added the server-only Resend email provider foundation. Phase 11G added public forgot-password email reset for eligible active patients and completed/setup doctors. Admin public reset, invite-only doctor reset, and 2FA remain deferred. |
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
| T501 | DONE | Create patient workspace route structure | Patient workspace routes exist with a responsive dashboard shell and navigation. Doctor directory, booking, consultation detail, PostgreSQL/Prisma text chat workflows, secure attachments, and safe patient profile editing are completed. True Realtime, video calls, diagnosis, prescriptions, medical notes, status changes, and admin management remain TODO. |
| T502 | DONE | Create doctor workspace route structure | Doctor workspace routes exist with a responsive dashboard shell and navigation. Doctor schedule management, consultation list/detail views, PostgreSQL/Prisma text chat workflows, secure attachments, and limited doctor public profile editing are completed. True Realtime, video calls, diagnosis, prescriptions, medical notes, status changes, admin management, recurring schedules, and booked slot cancellation remain TODO. |
| T503 | DONE | Create admin workspace route structure | Admin workspace routes exist with a responsive aggregate dashboard shell and navigation. Admin management actions remain TODO. |
| T504 | DONE | Add responsive layout patterns | Workspace shell and role dashboards use responsive desktop/mobile layout patterns. Further page-specific responsive checks remain part of quality work. |

## Milestone 6: Doctors, Scheduling, And Booking

| ID | Status | Task | Notes |
| --- | --- | --- | --- |
| T601 | DONE | Implement doctor specialty and profile management | Phase 10A Admin Doctor Management MVP and Phase 10B Admin Specialty Management MVP are completed: admins can create `DOCTOR` users with linked `DoctorProfile` records, manage specialties, assign existing active specialties, edit basic doctor fields, deactivate accounts, and control booking visibility. Admin schedule management, invite/password reset flow, 2FA, hard deletion workflows, and doctor self-service profile editing remain TODO/deferred. |
| T602 | DONE | Implement doctor list and filters | Patient doctor directory supports doctor name search and specialty filtering. Availability is shown on cards, but availability filtering remains deferred. |
| T603 | DONE | Implement doctor profile page | Patient-only doctor profile details and a read-only upcoming slot preview are completed. Booking, consultation creation, and schedule selection remain TODO. |
| T604 | DONE | Implement basic schedule slots | First-version doctor schedule management is completed: doctor schedule page, schedule slot creation, soft cancellation of future `AVAILABLE` slots, 30-minute minimum lead time for doctor slot creation, 30-minute minimum lead time for patient booking, and patient booking integration with newly created `AVAILABLE` slots. Recurring schedules, admin schedule management, `BOOKED` slot cancellation, consultation cancellation, payments, video calls, file uploads, Storage, Realtime, diagnosis, prescriptions, medical notes, and status changes remain TODO. |
| T605 | DONE | Implement consultation booking | First-version patient booking is completed: selecting a future available slot creates a scheduled consultation and books the slot. PostgreSQL/Prisma text chat and doctor schedule management are completed. Uploads, true Realtime, Storage, video calls, payment, admin management, booked slot cancellation, consultation cancellation, diagnosis, prescriptions, medical notes, and status changes remain TODO. |

## Milestone 7: Consultation Chat And Files

| ID | Status | Task | Notes |
| --- | --- | --- | --- |
| T701 | DONE | Implement consultation chat persistence | PostgreSQL/Prisma text message persistence is completed for patient and doctor consultation detail pages. Realtime, Supabase Realtime subscriptions, files/uploads, Storage, video calls, diagnosis, prescriptions, medical notes, status changes, admin chat access, and admin management remain TODO. |
| T702 | TODO | Add Supabase Realtime chat UI updates | Safe polling auto-refresh is completed. True Supabase Realtime subscriptions and Supabase Realtime/RLS/JWT architecture remain TODO for a later security-planned phase. Files/uploads, Storage, video calls, diagnosis, prescriptions, medical notes, status changes, admin chat access, and admin management remain TODO. |
| T703 | DONE | Implement file attachment metadata and storage flow | First-version secure consultation file attachments are completed and manual browser QA passed: patients and doctors can upload/download allowed files through server-mediated routes, blobs are stored in private Supabase Storage, and metadata is stored in PostgreSQL. True Supabase Realtime, video calls, legal prescription workflow, admin attachment/message access, virus scanning, advanced file previews, and production hardening remain TODO/deferred. |
| T704 | TODO | Add future call-ready message types | `CALL_STARTED`, `CALL_ENDED` should be supported in the enum. |
| T705 | DONE | Implement first-version doctor consultation completion summary | Assigned doctors can complete `SCHEDULED` and `IN_PROGRESS` consultations and save one plain-text `doctorNotes` summary for patient read-only viewing. Legal prescription workflow, structured diagnosis/recommendation/follow-up fields, uploads, Storage, Realtime, video calls, payment, admin management, admin message access, and time-based chat restrictions remain TODO/deferred. |
| T706 | DONE | Implement consultation history and archive rules | Patient and doctor consultation lists now support Upcoming, Completed, and All filters. Completed consultations stay visible and accessible, chat history is preserved, and completed chat is read-only with `POST /api/messages` returning a safe `409`. File uploads, Storage, Realtime, video calls, payment, legal prescription workflow, structured diagnosis fields, admin message access, admin management, and hard deletion remain TODO/deferred. |

## Milestone 8: Admin And Audit

| ID | Status | Task | Notes |
| --- | --- | --- | --- |
| T801 | TODO | Implement minimal admin management screens | Phase 10A Admin Doctor Management MVP, Phase 10B Admin Specialty Management MVP, Phase 11B Admin Doctor Invite MVP, and Phase 11C admin-generated doctor password reset links are completed. Remaining admin scope includes admin schedule management, admin patient management, admin consultation management, admin chat/message/file access, break-glass audited access, 2FA, billing/payment, hard deletion workflows, and broader audit-log workflows. |
| T802 | TODO | Add audit log creation for important actions | Login failure if practical, admin changes, consultation status, file uploads. |

## Milestone 9: Quality And Deployment

| ID | Status | Task | Notes |
| --- | --- | --- | --- |
| T901 | TODO | Add responsive and state coverage checks | Phase 7B completed a code-level MVP workflow QA and small copy polish pass. Phase 10C completed MVP UI copy/workflow polish for login and patient-facing booking/chat/file copy. Broader authenticated browser, responsive, loading, empty, error, unauthorized, forbidden, and not-found coverage remains TODO. |
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
