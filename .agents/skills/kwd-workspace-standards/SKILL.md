---
name: kwd-workspace-standards
description: >
  KWD (Kesararam With Digital) workspace standards, directory hierarchy, and cleanup
  safety protocols. USE THIS whenever you inspect repository structure, reorganize files,
  clean up unused folders, or manage media assets. Enforces what is production code (src/, public/),
  what is documentation (docs/), what can be moved to external storage (KWD_Media_Library/),
  and what is safe to delete (caches, local DB dumps).
---

# KWD Workspace Standards & Directory Topology

## 1. Safety Boundaries: File Classification

When managing or editing files in KWD, adhere to these strict classification tiers:

### 🔴 Tier 1: Critical Production Runtime (NEVER DELETE / MOVE)
* `src/app/**`: All page routes, layouts, and API routes.
* `src/components/**`: UI components, ScorePlates, GameKit engines, Brand Kit.
* `src/db/**`: Drizzle ORM schemas and database models.
* `src/lib/**`: Auth, Solo Driver ranking, Neon DB connector, scoring engines.
* `src/context/**` & `src/i18n/**`: Language context and translation dictionaries (`en.json`, `kh.json`).
* `public/**`: Static web assets, road traffic sign SVGs (`public/signs/`), Khmer fonts (`public/fonts/`).
* Root Configs: `package.json`, `pnpm-lock.yaml`, `next.config.ts`, `tsconfig.json`, `drizzle.config.ts`, `.env.local`.

---

### 🟡 Tier 2: Documentation & Specifications (KEEP IN REPO)
* `docs/**`: System architecture specs, gamification research, scoring policies.
* `README.md`, `SECURITY.md`, `AGENTS.md`: Governance and developer guidelines.

---

### 🔵 Tier 3 & 4: Staged in `_KWD_CLEANUP_VAULT/` (Ignored by Git)
Everything outside production is organized in one central vault:
* `_KWD_CLEANUP_VAULT/1_MOVE_TO_EXTERNAL_STORAGE/` (Contains `KWD_Media_Library/` — move to Google Drive/SSD)
* `_KWD_CLEANUP_VAULT/2_SAFE_TO_DELETE_NOW/` (Contains `backups/`, `BACKUP_SECTIONS.md`, `tsconfig.tsbuildinfo`, IDE caches)

---

## 2. Directory Map Reference

Refer to the full specification document at:
[`/docs/workspace-structure-and-cleanup.md`](../../../docs/workspace-structure-and-cleanup.md)
