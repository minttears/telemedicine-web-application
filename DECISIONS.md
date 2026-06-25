# Decisions

## Decision Log

### D001: Build The MVP With Next.js App Router

Status: Accepted

Use Next.js App Router as the web and backend framework. Backend behavior should be implemented through Route Handlers, not a separate Express server.

Reason: The requirements specify Next.js App Router and explicitly exclude a separate Express backend for the MVP.

### D002: Use Custom Session-Cookie Authentication

Status: Accepted

Authentication will use custom session-cookie auth with server-side sessions stored in PostgreSQL.

Reason: The application needs explicit roles, server-side access checks, future TOTP 2FA, and full control over the login flow. Auth.js is not part of the MVP unless the user later requests it.

### D003: Use Prisma For PostgreSQL Access

Status: Accepted

Use Prisma ORM for PostgreSQL reads, writes, migrations, and schema management.

Reason: Prisma provides type-safe database access and is a good fit for Next.js, TypeScript, Node.js, and PostgreSQL.

### D004: Use Supabase For Database, Realtime, And Storage

Status: Accepted

Use Supabase Postgres for the database, Supabase Realtime for chat UI updates, and Supabase Storage for attached files.

Reason: Supabase keeps Postgres, Realtime, and Storage in one service. PostgreSQL remains the source of truth for chat messages and file metadata.

### D005: Keep Scheduling Simple In The MVP

Status: Accepted

Use basic doctor schedule slots. Do not implement recurring schedules, complex calendar logic, or external calendar integrations in the MVP.

Reason: The first working version should support booking without turning scheduling into a separate large product.

### D006: Prepare But Do Not Use 2FA In The First Iteration

Status: Accepted

The database can include future 2FA models, but the app should not enforce or expose 2FA in the first implementation phase.

Reason: Basic auth, roles, dashboards, booking, and chat should work first. 2FA will be added as a separate milestone.

### D007: No Emoji In The UI

Status: Accepted

Use SVG icons, vector icons, status badges, illustrations, and text labels instead of emoji.

Reason: The desired style is clean, minimal, and professional.

### D008: Use MCP For Current Docs And UI Verification When Available

Status: Accepted

Use Context7 MCP for current framework/library documentation and Playwright MCP for UI flow verification when available.

Reason: Next.js, Supabase, Prisma, and Vercel APIs can change. Playwright improves confidence that frontend flows actually work.

### D009: Keep Git Actions User-Approved

Status: Accepted

Codex may suggest commits, branches, pushes, and pull requests, but must ask before doing them.

Reason: The user wants control over repository history and deployment flow.

### D010: Use Prisma 7 Config For Database URL

Status: Accepted

Use `prisma.config.ts` for Prisma 7 datasource URL configuration in this project. `schema.prisma` defines the PostgreSQL provider, while `prisma.config.ts` reads `DATABASE_URL`.

Reason: Prisma 7 no longer accepts `url` and `directUrl` datasource properties inside `schema.prisma`. `DIRECT_URL` remains documented for later Supabase and migration work, but it is not used in the current Prisma config yet.

### D011: Use Session-Mode Connection For Prisma Migrations

Status: Accepted

Prisma migrations must use `DIRECT_URL` with the Supabase session-mode connection on port `5432`. `DATABASE_URL` may remain the transaction-mode pooler on port `6543` for later application and serverless query workflows.

Reason: Prisma migrations should not run through the transaction-mode pooler. Local `.env.local` values must never be printed, staged, or committed.

### D012: Use bcryptjs For Password Hashing

Status: Accepted

Use `bcryptjs` for development seed password hashing and future custom authentication password verification.

Reason: `bcryptjs` avoids native build friction, works in the current Node.js runtime, and provides a simple password hashing path for the MVP. Development seed accounts are development-only and must not be used in production.

### D013: Use Prisma PostgreSQL Adapter For Runtime Access

Status: Accepted

Use `@prisma/adapter-pg` when runtime scripts instantiate `PrismaClient` for PostgreSQL access with Prisma 7.

Reason: Prisma 7 requires runtime client options for direct database access. The PostgreSQL adapter provides the required runtime connection path for seed scripts and future server-side Prisma usage.

### D014: Use `telemedicine_session` As The Session Cookie Name

Status: Accepted

Use `telemedicine_session` as the custom auth session cookie name.

Reason: A project-specific cookie name is explicit, avoids Auth.js conventions, and keeps session handling easy to identify in backend code.

### D015: Use Fixed 7-Day Sessions For The Initial Auth Foundation

Status: Accepted

Sessions expire after 7 days using `Session.expiresAt`. Sliding renewal is not implemented in Phase 3A.

Reason: Fixed expiry keeps the first session implementation simple and auditable while still supporting a reasonable MVP sign-in duration.

### D016: Allow Multiple Sessions And Revoke Only The Current Session On Logout

Status: Accepted

Users may have multiple active sessions. Logout revokes only the session represented by the current request cookie.

Reason: This supports normal use across multiple browsers/devices while keeping logout behavior predictable. Logout-all-devices can be added later.

### D017: Defer Failed Login Audit Logging

Status: Accepted

Failed login attempts return generic errors, but `AuditLog.LOGIN_FAILED` records are deferred to a later auth hardening phase.

Reason: The auth foundation should establish secure login/logout mechanics first. Audit logging needs a broader policy for rate limiting, metadata, retention, and alerting.

### D018: Store Invite And Reset Tokens As Hashes Only

Status: Accepted

Doctor invite and password reset flows will use `AccountAccessToken` records that store SHA-256 hashes of secure random raw tokens, plus token type, expiration, one-time-use state, target user, and optional creator user.

Reason: Raw invite/reset tokens are bearer credentials. Storing only hashes follows the existing session-token pattern and limits damage if database records are exposed. Email delivery, invite UI, set-password pages, reset pages, and 2FA remain separate approved phases.

### D019: Use Resend With Direct Fetch For MVP Transactional Email

Status: Accepted

Use Resend as the MVP transactional email provider and call its API with server-side `fetch` first, without installing the Resend SDK.

Reason: Resend is simple for a Next.js/Vercel MVP, has a usable free transactional tier, and direct `fetch` avoids an extra dependency while the app only needs first-version password reset email delivery.

### D020: Store Registration Consent On User

Status: Accepted

Patient registration consent is stored as nullable account-level fields on `User`: `termsAcceptedAt`, `privacyAcceptedAt`, `telemedicineConsentAcceptedAt`, and `legalConsentVersion`.

Reason: Consent is tied to the account created during public patient registration. Nullable fields preserve compatibility for existing seeded, development, and historical accounts. Future re-consent and production legal workflows remain deferred.

### D021: Store Profile Images In Private Storage Paths

Status: Accepted

Patient avatars use nullable `User.avatarStoragePath`; doctor professional photos use nullable `DoctorProfile.photoStoragePath`. Image bytes are stored in a separate private Supabase Storage bucket named `profile-images` and served through backend routes after authorization.

Reason: Profile images have different access rules from consultation attachments. Private storage paths preserve control over patient self-only avatars and patient-facing doctor photos without exposing direct Supabase Storage URLs or service role credentials.

### D022: Store Doctor Reviews Per Completed Consultation

Status: Accepted

Doctor reviews use a dedicated `DoctorReview` model linked to one consultation, one doctor profile, and one patient profile. `consultationId` is unique to enforce one review per consultation. Patients can create reviews only for their own completed consultations. Public review displays use `Verified patient` instead of patient names or private profile data.

Reason: Reviews belong to verified care interactions and should not expose patient identity. A normalized review table keeps rating aggregation accurate without denormalized average fields in the MVP.

### D023: Extend Consultation For Structured Outcomes

Status: Accepted

Structured consultation outcomes extend `Consultation` with nullable fields for diagnosis status, diagnosis details, doctor recommendations, medication notes, follow-up instructions, and additional notes. Existing `Consultation.doctorNotes` remains the required conclusion/summary and preserves compatibility with completed consultations created before structured outcomes.

Reason: The MVP has exactly one outcome per consultation and already completes consultations through `Consultation`. Nullable fields avoid a separate model and keep old completed consultations readable while deferring official prescription workflows and outcome editing.

### D024: Use Static Symptom-To-Specialty Mapping For Doctor Discovery

Status: Accepted

Patient doctor directory symptom filtering uses a curated in-code mapping from symptom slugs to specialty slugs. It does not store symptoms in the database and does not infer diagnosis, severity, urgency, or medical triage.

Reason: The MVP needs a simple discovery helper without schema changes, dependencies, AI, or a medical triage workflow. Specialty slugs keep the mapping stable across dev seed data and admin-managed specialties.

### D025: Use Daily For MVP Video Calls

Status: Superseded by D027

Use Daily Prebuilt as the MVP video provider. The app creates private Daily rooms server-side and issues short-lived Daily meeting tokens only after authenticated patient/assigned-doctor consultation checks.

Reason: Daily avoids custom WebRTC signaling, STUN/TURN, and media infrastructure for the Vercel MVP while supporting private rooms and server-issued access. Provider API keys remain server-only. Recording, transcription, screen sharing, group calls, public call links, raw WebRTC signaling, Supabase Realtime signaling, and admin call access are excluded from this phase.

### D026: Embed Daily Prebuilt With `@daily-co/daily-js`

Status: Superseded by D027

Use `@daily-co/daily-js` to embed Daily Prebuilt in role-scoped patient and doctor call pages. The client joins with `join({ url, token })` after the authenticated app API issues a short-lived participant token.

Reason: Daily Prebuilt gives the MVP camera, microphone, mute, camera toggle, and leave controls without custom WebRTC UI. Passing the token to `join()` keeps it out of URLs, rendered markup, local storage, session storage, and PostgreSQL. `DAILY_API_KEY` remains server-only.

### D027: Replace Daily With LiveKit For MVP Video Calls

Status: Accepted

Use LiveKit Cloud as the active MVP video provider. The app reuses the existing `ConsultationCallSession` model with `provider = "livekit"`, creates consultation-specific random room names, and issues short-lived LiveKit participant tokens only after authenticated patient/assigned-doctor consultation checks.

Reason: Daily real calls required a payment method, while LiveKit Cloud Free Build better matches the current hard-cap/free MVP requirement. LiveKit official React components provide camera, microphone, local/remote video, and leave controls without custom signaling. `LIVEKIT_API_KEY` and `LIVEKIT_API_SECRET` remain server-only. Recording, transcription, egress, screen sharing, group calls, public call links, raw WebRTC signaling, Supabase Realtime signaling, and admin call access are excluded from this phase.

### D028: Use Consultation Start-To-End Window For MVP Video Calls

Status: Accepted

Video calls are available from the scheduled consultation start time until the consultation end time. When a linked schedule slot exists, its `startsAt` and `endsAt` define the window; otherwise the fallback end is 60 minutes after `Consultation.scheduledAt`.

Reason: This avoids pre-start joining and matches the expected appointment window. Local QA should create near-now dev consultations instead of changing system time because LiveKit participant tokens depend on real clock time. The app's persisted PostgreSQL consultation chat remains the source of truth; built-in LiveKit chat is a known limitation and should not be used for consultation records.

### D029: Require TOTP 2FA For Doctors And Admins

Status: Accepted

Require TOTP authenticator-app 2FA for `DOCTOR` and `ADMIN` accounts while leaving `PATIENT` login unchanged. Store TOTP secrets encrypted with AES-256-GCM, store recovery codes and temporary challenge tokens only as hashes, and issue full sessions only after required setup or verification succeeds.

Reason: Higher-privilege accounts need a second authentication factor without introducing SMS, email OTP, or passkey scope. A default-enabled `TWO_FACTOR_ENFORCEMENT_ENABLED` rollback flag allows emergency operational disablement without changing patient authentication.

### D030: Require Strong Verification For 2FA Recovery-Code Management

Status: Accepted

Doctors and admins may regenerate their own recovery codes only after verifying their current password plus either the current TOTP code or one unused recovery code. Admins may reset a doctor's enrollment without viewing any secret or code; the reset revokes doctor sessions and forces re-enrollment.

Reason: Recovery-code replacement and administrative enrollment reset are account-recovery operations. Requiring two independent credentials for self-service and revoking sessions for admin reset preserves Phase 15A enforcement while providing an operational recovery path.

### D031: Keep The 2FA Encryption Key Stable

Status: Accepted

`TWO_FACTOR_ENCRYPTION_KEY` must remain stable after any account enrolls in 2FA. `TWO_FACTOR_ENFORCEMENT_ENABLED="false"` is reserved for emergency local development or recovery use and is not the normal production posture.

Reason: Enrolled TOTP secrets are encrypted with the configured key and cannot be verified if that key is replaced. The enforcement flag provides a controlled temporary recovery path without weakening the default requirement for doctor and admin accounts.

### D032: Translate The MVP With Direct Russian Copy

Status: Accepted

Translate user-facing copy directly in the existing pages, components, email templates, and safe API messages, using formal Russian `вы`. Do not introduce an i18n dependency during the MVP translation phases.

Reason: The current product targets a Russian interface and has no active multi-language requirement. Direct copy changes minimize refactoring risk and preserve existing auth, routing, API, session, and security behavior. Brands and technical identifiers remain untranslated.

### D033: Keep Database And User-Generated Medical Text Unchanged During UI Translation

Status: Accepted

Phases 16C and 16D translate patient- and doctor-facing presentation copy and curated in-code labels, but do not translate specialty slugs, database values, seed doctor text, personal names, patient-provided profile values, messages, reviews, consultation outcomes, or uploaded filenames.

Reason: Translating persisted or user-generated content would exceed a copy-only UI phase and could change data semantics. Seed/demo medical text remains a separate Phase 16F final-pass task.

### D034: Preserve Admin Contracts During Russian UI Translation

Status: Accepted

Phase 16E translates admin-facing presentation copy, safe visible validation messages, accessibility labels, and date/time formatting without changing admin authorization, route paths, API response keys, status codes, audit action enum values, invite/reset token behavior, or the required `RESET 2FA` confirmation phrase.

Reason: Admin workflows include security-sensitive doctor onboarding, password recovery, and two-factor reset operations. Keeping their existing contracts unchanged limits the translation phase to presentation while preserving established authorization and audit behavior.

## Pending Decisions

- Exact application name and public branding.
- Primary accent color: calm blue, teal, or green.
- Whether doctor profiles are fully public or partially public.
- File size limits and final allowed attachment MIME types.
- Admin policy for exceptional access to private chat content.
- Session renewal strategy.
- Whether to add shadcn/ui after base Tailwind setup.
