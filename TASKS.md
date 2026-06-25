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
| T203 | DONE | Add seed data | Development admin, doctor, patient, expanded specialties, multiple doctor profiles, and future schedule slots are seeded idempotently for local/dev workflows. |
| T204 | DONE | Validate Prisma setup | Initial migration was created/applied and Prisma validation commands passed. |

## Milestone 3: Authentication And Authorization

| ID | Status | Task | Notes |
| --- | --- | --- | --- |
| T301 | DONE | Build custom session-cookie authentication foundation | Custom session-cookie auth foundation is implemented without Auth.js. |
| T302 | DONE | Implement registration, login, logout | Patient registration, login UI/API, logout API, and protected workspaces are implemented. Phase 12C requires patient registration consent client-side and server-side and stores nullable account-level consent timestamps/version for new patient users. Public doctor/admin registration is not allowed. |
| T303 | DONE | Implement role-based access helpers | Includes `getCurrentUser`, `requireUser`, `requireRole`, and API response helpers. |
| T304 | DONE | Add role-based redirects | Login redirects by role; protected workspace layouts enforce role access and wrong-role redirects. |
| T306 | DONE | Add account access token, doctor invite, and admin reset flows | Phase 11A added hashed, expiring, one-time token storage and helpers. Phase 11B added the Admin Doctor Invite MVP and doctor set-password flow. Phase 11C added admin-generated doctor password reset links. Phase 11F added the server-only Resend email provider foundation. Phase 11G added public forgot-password email reset for eligible active patients and completed/setup doctors. A critical Phase 11G account-targeting bug was fixed so recovery starts from the login email, `/forgot-password` has no editable recipient field, reset email goes only to the matched `User.email`, and reset completion targets only the token user. Phase 11H manually rechecked the corrected recovery UX. Phase 15A now requires doctor/admin 2FA after invite or password reset login. |
| T307 | DONE | Enforce TOTP 2FA for doctors and admins | Phase 15A adds encrypted TOTP secrets, QR/manual setup, hashed one-time recovery codes, hashed short-lived challenges, five-attempt challenge limits, privileged session gating, and a default-enabled rollback flag. Patient login is unchanged. |
| T308 | DONE | Add 2FA management and admin doctor reset | Phase 15B adds doctor/admin status pages, strong-verification recovery-code regeneration, and admin-only doctor enrollment reset with session revocation and forced re-enrollment. Self-disable and patient 2FA remain deferred. |
| T309 | DONE | Record 2FA manual QA status | Phase 15C records owner verification of doctor/admin setup and login behavior, recovery-code saving, and strict rejection of old TOTP windows. Authenticated regeneration and admin-reset flows remain pre-deployment re-check items. |
| T310 | DONE | Translate auth and 2FA UI to Russian | Phase 16B translates auth, password recovery, doctor invite/setup, 2FA, account-security controls, matching safe API messages, and password-reset email copy using formal Russian. Routes, response contracts, sessions, redirects, and enforcement are unchanged. |
| T311 | DONE | Translate patient workspace UI to Russian | Phase 16C translates patient navigation, dashboard, profile, doctor discovery, symptom labels, booking, consultation/chat/file/review/video UI, safe visible errors, and patient date/time formatting using formal Russian. Logic, routes, response contracts, sessions, authorization, and 2FA behavior are unchanged; seed/demo medical text remains deferred. |
| T312 | DONE | Translate doctor workspace UI to Russian | Phase 16D translates doctor navigation, dashboard, profile, schedule, dev-only video QA controls, consultation completion/outcomes, chat/file/video surfaces, placeholders, safe visible errors, and doctor date/time formatting using formal Russian. Schedule, completion, authorization, sessions, routes, contracts, and 2FA behavior are unchanged; seed/demo medical text remains deferred. |
| T313 | DONE | Translate admin workspace UI to Russian | Phase 16E translates admin navigation, dashboard, doctor and specialty management, user/consultation/audit placeholders, settings context, admin forms, safe visible API errors, accessibility labels, and date/time formatting using formal Russian. Admin authorization and management logic, routes, contracts, sessions, and 2FA behavior are unchanged; persisted seed/demo content remains deferred to Phase 16F. |
| T314 | DONE | Complete the Russian UI pass | Phase 16F translates public/legal/common UI, root metadata and language, global states, remaining safe visible errors, development QA presentation text, and seeded medical descriptions. Personal names, slugs, identifiers, technical terms, contracts, and application logic remain unchanged; existing database rows require an intentional idempotent reseed to receive seed-copy updates. |
| T305 | DONE | Add basic auth validation states | Auth forms now include field-level errors, submission errors, disabled submit states, and Phase 12B show/hide password controls. Broader forbidden/unauthorized route-state polish remains part of quality work. |

## Milestone 4: Public Pages And SEO

| ID | Status | Task | Notes |
| --- | --- | --- | --- |
| T401 | DONE | Create public route structure | `/`, `/doctors`, doctor profile, about, contacts, privacy, terms, and telemedicine consent exist. Phase 16F adds Russian public navigation/footer, landing copy, public information states, and translated MVP legal pages. |
| T402 | TODO | Add SEO metadata plan | Metadata API, Open Graph, canonical where appropriate. |
| T403 | TODO | Add sitemap and robots routes | Exclude authenticated dashboards. |
| T404 | TODO | Add favicon and app icon | Clean medical/minimal style. |

## Milestone 5: Workspaces And Core UI

| ID | Status | Task | Notes |
| --- | --- | --- | --- |
| T501 | DONE | Create patient workspace route structure | Patient workspace routes exist with a responsive dashboard shell and navigation. Doctor directory, booking, consultation detail, PostgreSQL/Prisma text chat workflows, secure attachments, safe patient profile/avatar editing, dashboard summaries, consultation-list count copy, and a patient files empty state are completed. True Realtime, video calls, diagnosis, prescriptions, medical notes, status changes, and admin management remain TODO. |
| T502 | DONE | Create doctor workspace route structure | Doctor workspace routes exist with a responsive dashboard shell and navigation. Doctor schedule management, consultation list/detail views, PostgreSQL/Prisma text chat workflows, secure attachments, limited doctor public profile/photo editing, dashboard schedule guidance, and a secure assigned-consultation files archive are completed. True Realtime, video calls, diagnosis, prescriptions, medical notes, status changes, admin management, recurring schedules, and booked slot cancellation remain TODO. |
| T503 | DONE | Create admin workspace route structure | Admin workspace routes exist with a responsive aggregate dashboard shell and navigation, including aggregate availability and active-consultation dashboard details. Remaining broader admin management actions remain TODO. |
| T504 | DONE | Add responsive layout patterns | Workspace shell and role dashboards use responsive desktop/mobile layout patterns. Further page-specific responsive checks remain part of quality work. |

## Milestone 6: Doctors, Scheduling, And Booking

| ID | Status | Task | Notes |
| --- | --- | --- | --- |
| T601 | DONE | Implement doctor specialty and profile management | Phase 10A Admin Doctor Management MVP and Phase 10B Admin Specialty Management MVP are completed: admins can create `DOCTOR` users with linked `DoctorProfile` records, manage specialties, assign existing active specialties, edit basic doctor fields, deactivate accounts, and control booking visibility. Admin schedule management, hard deletion workflows, and broader doctor self-service profile management remain TODO/deferred; invite/password reset and required 2FA are implemented. |
| T602 | DONE | Implement doctor list and filters | Patient doctor directory supports doctor name search, specialty filtering, symptom-helper filtering, server-served professional doctor photos, ratings/review count, and availability display. Symptom filtering maps curated symptoms to specialty slugs and is not diagnosis, AI triage, or emergency medical advice. Availability filtering remains deferred. |
| T603 | DONE | Implement doctor profile page | Patient-only doctor profile details, server-served professional doctor photos, and a read-only upcoming slot preview are completed. Booking, consultation creation, and schedule selection remain TODO. |
| T604 | DONE | Implement basic schedule slots | First-version doctor schedule management is completed: doctor schedule page, schedule slot creation, soft cancellation of future `AVAILABLE` slots, 30-minute minimum lead time for doctor slot creation, 30-minute minimum lead time for patient booking, and patient booking integration with newly created `AVAILABLE` slots. Recurring schedules, admin schedule management, `BOOKED` slot cancellation, consultation cancellation, payments, video calls, file uploads, Storage, Realtime, diagnosis, prescriptions, medical notes, and status changes remain TODO. |
| T605 | DONE | Implement consultation booking | First-version patient booking is completed: selecting a future available slot creates a scheduled consultation and books the slot. PostgreSQL/Prisma text chat and doctor schedule management are completed. Uploads, true Realtime, Storage, video calls, payment, admin management, booked slot cancellation, consultation cancellation, diagnosis, prescriptions, medical notes, and status changes remain TODO. |
| T606 | DONE | Implement doctor reviews and ratings | Phase 12F added `DoctorReview` with one review per completed patient-owned consultation, patient-only review creation, 1-5 ratings, optional comments, patient directory/detail rating summaries, patient consultation review form/submitted review display, doctor dashboard/profile review visibility, and `Verified patient` public author labels. Review editing/deletion, doctor replies, admin moderation, public placeholder `/doctors` review display, and denormalized rating fields remain deferred. |

## Milestone 7: Consultation Chat And Files

| ID | Status | Task | Notes |
| --- | --- | --- | --- |
| T701 | DONE | Implement consultation chat persistence | PostgreSQL/Prisma text message persistence is completed for patient and doctor consultation detail pages. Phase 12E polished chat bubbles so current user messages align right, other participant messages align left, and safe avatars/photos appear where available. Realtime, Supabase Realtime subscriptions, video calls, diagnosis, prescriptions, medical notes, status changes, admin chat access, message editing/deleting, read receipts, typing indicators, and admin management remain TODO/deferred. |
| T702 | TODO | Add Supabase Realtime chat UI updates | Safe polling auto-refresh is completed. True Supabase Realtime subscriptions and Supabase Realtime/RLS/JWT architecture remain TODO for a later security-planned phase. Files/uploads, Storage, video calls, diagnosis, prescriptions, medical notes, status changes, admin chat access, and admin management remain TODO. |
| T703 | DONE | Implement file attachment metadata and storage flow | First-version secure consultation file attachments are completed and manual browser QA passed: patients and doctors can upload/download allowed files through server-mediated routes, blobs are stored in private Supabase Storage, and metadata is stored in PostgreSQL. Phase 12B added patient and doctor Files pages as secure archives/indexes for existing consultation attachments; uploads remain inside consultation chats and downloads still go through `/api/files/[attachmentId]`. True Supabase Realtime, video calls, legal prescription workflow, admin attachment/message access, virus scanning, advanced file previews, deletion, free-standing uploads, and production hardening remain TODO/deferred. |
| T704 | DONE | Add future call-ready message types | `CALL_STARTED` and `CALL_ENDED` are supported in the `MessageType` enum. UI/API behavior for call events remains deferred. |
| T705 | DONE | Implement first-version doctor consultation completion summary | Assigned doctors can complete `SCHEDULED` and `IN_PROGRESS` consultations and save a structured consultation outcome for patient read-only viewing. `doctorNotes` remains the required conclusion/summary for compatibility; new structured completion requires a diagnosis status and supports optional diagnosis details, doctor recommendations, medication notes, follow-up instructions, and additional notes. Official prescriptions, legal prescription workflow, medication database, PDF generation, e-signature, pharmacy integration, doctor outcome editing after completion, uploads, Storage, Realtime, video calls, payment, admin medical content access, and time-based chat restrictions remain TODO/deferred. |
| T706 | DONE | Implement consultation history and archive rules | Patient and doctor consultation lists now support Upcoming, Completed, and All filters. Completed consultations stay visible and accessible, chat history is preserved, and completed chat is read-only with `POST /api/messages` returning a safe `409`. File uploads, Storage, Realtime, video calls, payment, legal prescription workflow, structured diagnosis fields, admin message access, admin management, and hard deletion remain TODO/deferred. |
| T707 | DONE | Add video provider foundation | Phase 14B selected Daily initially, then Phase 14D replaced it with LiveKit because Daily required a payment method for real calls. The active implementation uses LiveKit room names, short-lived participant tokens, existing call-session persistence, strict patient/assigned-doctor authorization, documented env placeholders, and a consultation call panel. |
| T708 | DONE | Add LiveKit video call UI | Phase 14D replaced Daily Prebuilt with LiveKit official React components on dedicated patient/doctor call pages. The existing call panel links to the role-scoped call page, the client requests a short-lived token only after join/start, and tokens are kept in memory only. Recording, transcription, screen sharing, persistent media storage, group calls, public links, raw WebRTC signaling, and admin call access remain excluded. |
| T709 | DONE | Polish video call QA flow | Phase 14E added a dev-only doctor QA action for near-now test consultations, changed the video access window to consultation start through consultation end, recorded manual QA success for assigned doctor/owning patient calls and rejection cases, documented that system time must not be changed for provider-token testing, and tracks built-in LiveKit chat as a known limitation. |

## Milestone 8: Admin And Audit

| ID | Status | Task | Notes |
| --- | --- | --- | --- |
| T801 | TODO | Implement minimal admin management screens | Phase 10A Admin Doctor Management MVP, Phase 10B Admin Specialty Management MVP, Phase 11B Admin Doctor Invite MVP, Phase 11C admin-generated doctor password reset links, and Phase 15B admin doctor 2FA reset are completed. Remaining admin scope includes admin schedule management, admin patient management, admin consultation management, admin chat/message/file access, break-glass audited access, billing/payment, hard deletion workflows, and broader audit-log workflows. |
| T802 | TODO | Add audit log creation for important actions | Login failure if practical, admin changes, consultation status, file uploads. |

## Milestone 9: Quality And Deployment

| ID | Status | Task | Notes |
| --- | --- | --- | --- |
| T901 | TODO | Add responsive and state coverage checks | Phase 7B completed a code-level MVP workflow QA and small copy polish pass. Phase 10C completed MVP UI copy/workflow polish for login and patient-facing booking/chat/file copy. Recent polish added auth form, dashboard, consultation-list, Files archive, legal page, registration-consent, avatar/photo, and messenger-style chat UX improvements. Broader authenticated browser, responsive, loading, empty, error, unauthorized, forbidden, and not-found coverage remains TODO. |
| T902 | TODO | Add deployment configuration guidance for Vercel | Ensure environment variables are documented. Include Resend sender domain/DNS verification for production email readiness; `onboarding@resend.dev` is limited to local testing. |
| T903 | TODO | Add basic quality gates | Lint, typecheck, build, and Prisma validation scripts when app setup exists. |
| T904 | TODO | Use Playwright MCP to verify key UI flows when available | Login, dashboards, booking, chat. |

## Deferred Features

| ID | Status | Task | Notes |
| --- | --- | --- | --- |
| D001 | DONE | 2FA enforcement and management for doctors and admins | Enforcement completed in Phase 15A; self-management and admin doctor reset completed in Phase 15B. Self-disable, patient-required 2FA, SMS/email OTP, and passkeys remain deferred. |
| D002 | DEFERRED | Video call hardening | LiveKit call UI is implemented for the MVP and Phase 14E added local QA helpers. Full production device/network QA, call end persistence, recording, transcription, group calls, admin call access, and built-in LiveKit chat cleanup remain deferred. Screen sharing remains disabled. |
| D003 | DEFERRED | Patient intake questionnaire | Add after core consultation flow works. |
| D004 | DEFERRED | Consultation archive download | Export chat, files, final diagnosis/notes. |
| D005 | DEFERRED | AI consultation summaries | Summary only, not diagnosis. |
| D006 | DEFERRED | PWA and mobile-specific enhancements | Responsive web first. |
