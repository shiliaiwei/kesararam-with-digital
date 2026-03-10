---
description: "KWD Platform — Kesararam With Digital. Build Cambodian driving education web app. Activates for all files."
applyTo: "**"
---

# KWD Platform — Quick Reference

## Stack

Next.js 16, TypeScript, Tailwind CSS v4, shadcn/ui, Drizzle ORM, Neon Postgres, JWT auth.

## Design: Neo-Brutalism only

- `border-2 border-black` on all interactive elements
- `shadow-[4px_4px_0_#000]` hard shadows, no blur
- Zero gradients
- Traffic-light palette: yellow #eab308, blue #3b82f6, red #ef4444, green #22c55e, orange #f97316, cyan #06b6d4, purple #a855f7, rose #fda4af

## Paths

- Public pages: `src/app/(public)/`
- Dashboard: `src/app/(dashboard)/`
- Components: `src/components/`
- DB schema: `src/db/schema/`
- Server actions: `src/app/actions/`
- API routes: `src/app/api/`

## Conventions

- No emoji in UI
- No "click here" / "learn more" / "read more" link text
- Skeleton loaders for all async content
- All content CRUD-managed by admin
- Server actions for all DB writes (`"use server"`)
- Never expose DATABASE_URL or API keys client-side

## DB

Run migrations: `npx drizzle-kit push`
Generate: `npx drizzle-kit generate`
