# KWD Road Safety Rank Tiers — locked spec

> Source of truth for the **new** rank system at `src/lib/ranks.ts` +
> `src/components/rank/*` (demo: `/ranks`). Coexists with legacy `src/lib/rank-utils.ts`.
> Last set by the user 2026-06-19.

## Rules (hard)

- **Exactly 6 rank tiers**, in order: **Rookie → Rising → Gold → Platinum → Diamond → Mythic**.
  - Mythic is the highest, final rank. (NO Master / Elite / Legend / Highmaster. NO "Supreme".)
- **Roman-numeral divisions** inside every tier: **IV → III → II → I** (IV lowest, I highest before rank-up).
- Rank names are **English only**, UPPERCASE on badges. Never translated to Khmer.
- Only `score` is stored; rank + division are always **derived** from score.

## Point thresholds & division ranges (lifetime points)

| Rank | Tier min | Division | Points |
|------|----------|----------|--------|
| **Rookie** | 0 | IV | 0 – 249 |
| | | III | 250 – 499 |
| | | II | 500 – 749 |
| | | I | 750 – 999 |
| **Rising** | 1,000 | IV | 1,000 – 1,374 |
| | | III | 1,375 – 1,749 |
| | | II | 1,750 – 2,124 |
| | | I | 2,125 – 2,499 |
| **Gold** | 2,500 | IV | 2,500 – 2,749 |
| | | III | 2,750 – 2,999 |
| | | II | 3,000 – 3,249 |
| | | I | 3,250 – 3,499 |
| **Platinum** | 3,500 | IV | 3,500 – 4,374 |
| | | III | 4,375 – 5,249 |
| | | II | 5,250 – 6,124 |
| | | I | 6,125 – 6,999 |
| **Diamond** | 7,000 | IV | 7,000 – 8,249 |
| | | III | 8,250 – 9,499 |
| | | II | 9,500 – 10,749 |
| | | I | 10,750 – 11,999 |
| **Mythic** | 12,000 | IV | 12,000 – 14,999 |
| | | III | 15,000 – 19,999 |
| | | II | 20,000 – 29,999 |
| | | I | 30,000+ |

Notes:
- Rookie → Diamond divisions are **even quarters** of each tier's range (so the
  even-quartering logic in `getDivisionByScore` reproduces them exactly).
- **Mythic divisions are open-ended and uneven** → encoded via
  `RankConfig.divisionThresholds: [12000, 15000, 20000, 30000]`. Mythic I (30,000+)
  is the cap.
- Migration multiplier is ×10 (`MIGRATION_MULTIPLIER`), easy to retune.

## Frame style (per-rank, brutalist road-sign — PENDING build)

Each tier should get its own distinctive road-sign frame shape (not a uniform
ring): Rookie = black/white road-marker square; Rising = yellow chevron caution
square; Gold = yellow warning **diamond**; Platinum = blue info **shield**; Diamond
= blue diamond **crystal**; Mythic = purple elite **crown crest** with gold accents.
Photo stays clean & centred; badges/effects outside the photo. Inspect
`src/components/rank/*`, `src/app/ranks`, and `src/app/(public)/brand/ranks` before
changing frame behavior.
