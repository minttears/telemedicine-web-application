# MCP Setup For Codex

## Purpose

This project should use MCP servers to improve documentation accuracy and frontend verification.

Recommended MCP servers:

- Context7 for current framework and library documentation.
- Playwright for UI/browser verification.

## Context7 MCP

Use Context7 when working with:

- Next.js App Router
- Prisma
- Supabase Postgres
- Supabase Realtime
- Supabase Storage
- Vercel
- Tailwind CSS
- other changing library APIs

Suggested command:

```bash
codex mcp add context7 -- npx -y @upstash/context7-mcp
```

## Playwright MCP

Use Playwright MCP when changing or verifying:

- login/register flow
- dashboards
- routing
- forms
- consultation booking
- chat UI
- responsive behavior
- browser console errors

Suggested command:

```bash
codex mcp add playwright -- npx @playwright/mcp@latest
```

## Instruction For Codex

After MCP setup, ask Codex:

```text
Re-read AGENTS.md, PROJECT_BRIEF.md, TASKS.md, DECISIONS.md, SECURITY.md, PLANS.md, and MCP_SETUP.md.

Check which MCP servers are available.

Use Context7 for current documentation when working with Next.js, Prisma, Supabase, Vercel, Tailwind, or dependency-specific APIs.
Use Playwright MCP to verify UI flows after frontend changes.

Do not change files yet.
Summarize the project and confirm when you would use each MCP server.
Wait for my next task.
```
