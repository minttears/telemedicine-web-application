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

## Pending Decisions

- Exact application name and public branding.
- Primary accent color: calm blue, teal, or green.
- Whether doctor profiles are fully public or partially public.
- File size limits and final allowed attachment MIME types.
- Admin policy for exceptional access to private chat content.
- Session expiration duration and renewal strategy.
- Whether to use Jitsi or another provider for the first video-call iteration.
- Whether to add shadcn/ui after base Tailwind setup.
