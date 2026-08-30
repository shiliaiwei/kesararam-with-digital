# KWD Agent Instructions

## Design Work Must Start With The Brand Skill

Before creating, editing, reviewing, or rewriting any user-facing design in this
project, read this file first:

`/.agents/skills/kwd-brand-design/SKILL.md`

This applies to every UI surface: pages, components, cards, buttons, forms,
modals, profile/leaderboard rank displays, game screens, badges, backgrounds,
marketing sections, OG images, and emails.

Do not start visual implementation from memory or generic design taste. The KWD
brand skill is the source of truth for brutalist road-sign styling, caution tape,
colors, typography, icons, rank frames, and banned wording.

If the work touches GameKit or `/play` activities, read this skill too:

`/.agents/skills/kwd-gamekit-build-workflow/SKILL.md`

If the work touches Leaderboard, Solo Driver ranking, Road Points currency, or ScorePlates, read this skill:

`/.agents/skills/kwd-gamification-leaderboard/SKILL.md`

If the work touches CI/CD, GitHub Actions, workflows, CodeQL, testing, or pushing/merging, read this skill:

`/.agents/skills/kwd-ci-codeql-pipeline/SKILL.md`

Then inspect the current code before editing and keep changes scoped to the
requested files or feature.

## Full Name Mandate — Never use "KWD"

Never use the abbreviation `KWD` in user-facing copy, titles, headings, documentation, or public text. Always write the full name: **`Kesararam With Digital`** (or Khmer: **`កេសរារាម ជាមួយឌីជីថល`**).

## Direct Git Push & Merge Quality Checklist

When the user says "push" or "merge" in the chat, do not ask for confirmation or clarify what to commit. Always follow these rules:

1. **Pre-Push Quality Gate:**
   - `pnpm run lint` — 0 ESLint errors.
   - `pnpm exec tsc --noEmit` — 0 TypeScript type errors.
   - `pnpm run test` — Vitest unit tests must pass.
2. **Never Track Credentials or Ignored Directories:**
   - Never commit raw passwords, API keys, `/scripts/`, `/data/`, or `/src/app/videoads/`.
   - Keep `src/test/` tracked as it contains pure in-memory test suites required by CI.
3. **Commit & Push:**
   - Immediately stage edited files by path, commit with a clear descriptive message, and push the branch.



