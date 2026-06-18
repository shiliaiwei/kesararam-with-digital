/**
 * Reward catalog — the SINGLE source of truth for claimable store items.
 *
 * Imported by both the claim API (src/app/api/user/claim/route.ts) and the
 * leaderboard UI (src/app/(public)/leaderboard/page.tsx) so costs can never
 * drift between the two.
 *
 * ── Store Points Economy (post-cutover, see docs/store-points-economy.md) ─────
 *  Source of truth for the math: calculateStorePoints() in
 *  src/lib/store-points/score.ts — small-number, server-authoritative: no speed,
 *  no streak. One correct answer = ONE Store Point, capped at 30/play, gated by a
 *  40% accuracy floor; credited via the single writer awardStorePoints().
 *  LIVE GAMES ONLY earn spendable points (solo/practice is rejected by the
 *  source guard) — so only live score can claim. Points land in the
 *  store_point_events ledger, subject to daily best-difference and a 150/week cap.
 *  Balances are DERIVED (getStoreBalances): store balance / lifetime earned / weekly earned.
 *
 *  Claiming spends lifetime-earned Store Points (minus non-rejected claim costs);
 *  see src/lib/claims.ts. The earning + read switch is gated by STORE_POINTS_ENABLED.
 *
 * ── Reward cost ladder (points, 1,000 → 12,000 scale) ────────────────────────
 *  Spans the rank-point range Rising (1,000) → Mythic (12,000) so costs read on
 *  the same scale as the rank ladder (2026-06-19). Rarity rises with cost:
 *   Eraser              (1,000)  COMMON    — the first goal
 *   Pencil              (1,500)  COMMON
 *   Pen                 (2,000)  RARE
 *   Ruler               (3,000)  RARE
 *   Highlighter         (4,000)  EPIC
 *   Notes               (5,000)  EPIC
 *   Notebook            (6,500)  LEGENDARY
 *   Kit                 (8,000)  LEGENDARY
 *   Planner             (10,000) MYTHIC
 *   Book Writer Lesson  (12,000) MYTHIC    — anchor; cost doubles each claim
 *
 *  Tune these freely; the claim API validates against this same list so costs
 *  can never drift between UI and server.
 *
 * This is pure data (no server-only imports) so it is safe in client bundles.
 */
export interface RewardItem {
  id: number;
  name: string;
  nameKh: string;
  cost: number;
  color: string;
  image: string;
}

export const REWARD_ITEMS: RewardItem[] = [
  { id: 5, name: "Eraser",      nameKh: "ជ័រលុប",           cost: 1000,  color: "#a855f7", image: "/rewards/eraser.webp" },
  { id: 2, name: "Pencil",      nameKh: "ខ្មៅដៃ",           cost: 1500,  color: "#eab308", image: "/rewards/pencil.webp" },
  { id: 3, name: "Pen",         nameKh: "ប៊ិច",              cost: 2000,  color: "#22c55e", image: "/rewards/pen.webp" },
  { id: 4, name: "Ruler",       nameKh: "បន្ទាត់",           cost: 3000,  color: "#f97316", image: "/rewards/ruler.webp" },
  { id: 6, name: "Highlighter", nameKh: "ប៊ិចសម្គាល់",       cost: 4000,  color: "#ef4444", image: "/rewards/highlighter.webp" },
  { id: 7, name: "Notes",       nameKh: "ក្រដាសសម្គាល់",     cost: 5000,  color: "#06b6d4", image: "/rewards/notes.webp" },
  { id: 1, name: "Notebook",    nameKh: "សៀវភៅកត់ត្រា",      cost: 6500,  color: "#3b82f6", image: "/rewards/notebook.webp" },
  { id: 8, name: "Kit",         nameKh: "ឧបករណ៍គណិត",       cost: 8000,  color: "#ec4899", image: "/rewards/kit.webp" },
  { id: 9, name: "Planner",     nameKh: "ផែនការសិក្សា",      cost: 10000, color: "#84cc16", image: "/rewards/planner.webp" },
  { id: 10, name: "Book Writer Lesson", nameKh: "មេរៀនសរសេរសៀវភៅ", cost: 12000, color: "#a855f7", image: "/rewards/book_writer_lesson.webp" },
];

/**
 * Rarity tier for a reward, derived from its cost. Drives the premium
 * collectible treatment on the card (ribbon colour, frame weight, label).
 */
export type RewardRarity = "common" | "rare" | "epic" | "legendary" | "mythic";

export function getRewardRarity(cost: number): RewardRarity {
  if (cost >= 10000) return "mythic";
  if (cost >= 6000) return "legendary";
  if (cost >= 4000) return "epic";
  if (cost >= 2000) return "rare";
  return "common";
}

export const RARITY_META: Record<RewardRarity, { label: string; labelKh: string; accent: string; glow: string }> = {
  common:    { label: "COMMON",    labelKh: "ធម្មតា",     accent: "#71717a", glow: "rgba(113,113,122,0.35)" },
  rare:      { label: "RARE",      labelKh: "កម្រ",       accent: "#3b82f6", glow: "rgba(59,130,246,0.45)" },
  epic:      { label: "EPIC",      labelKh: "អស្ចារ្យ",   accent: "#a855f7", glow: "rgba(168,85,247,0.45)" },
  legendary: { label: "LEGENDARY", labelKh: "រ៉ាងពិសេស",  accent: "#eab308", glow: "rgba(234,179,8,0.5)" },
  mythic:    { label: "MYTHIC",    labelKh: "ទេវកថា",     accent: "#ec4899", glow: "rgba(236,72,153,0.55)" },
};

/** Look up a reward by id (used by the claim API to validate cost). */
export function getRewardItem(id: number): RewardItem | undefined {
  return REWARD_ITEMS.find((r) => r.id === id);
}

/**
 * Calculate the dynamic cost of a reward item for a student based on their claim history.
 * For 'Book Writer Lesson' (id: 10), the cost doubles with each successful claim:
 * 1st claim = 12,000, 2nd claim = 24,000, 3rd claim = 48,000, etc.
 */
export function calculateDynamicCost(item: RewardItem, claimCount: number): number {
  if (item.id === 10) {
    return item.cost * Math.pow(2, claimCount);
  }
  return item.cost;
}

