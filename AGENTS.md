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

Then inspect the current code before editing and keep changes scoped to the
requested files or feature.

## Direct Git Push Workflow

When the user says "push" in the chat, do not ask for confirmation or clarify what to commit. Immediately stage the files you edited by path, commit them with a descriptive message, and push the branch.

