/**
 * Reward catalog — the SINGLE source of truth for claimable store items.
 *
 * Imported by both the claim API (src/app/api/user/claim/route.ts) and the
 * leaderboard UI (src/app/(public)/leaderboard/page.tsx) so costs can never
 * drift between the two.
 *
 * ── Points Economy (how points are actually earned & what counts) ─────────────
 *  Source of truth for the math: calculateScore() in src/lib/game-engine.ts —
 *  Kahoot-style time scoring: each correct answer is worth its difficulty base
 *  (easy 600 / medium 800 / hard 1000) scaled 0.5–1.0× by answer speed, plus a
 *  streak bonus of +100 per consecutive correct (cap +500). A correct answer is
 *  worth ~300–1000 points; a typical 10-question game is several thousand.
 *
 *  • Live teacher game  → full summed score → users.lifetimePoints AND a
 *      pointsLedger row source="live-session:{id}". This is the ONLY source that
 *      counts toward CLAIMING rewards (see src/app/api/user/claim/route.ts).
 *  • Solo practice game → full rawScore → pointsLedger row source="solo".
 *      Counts for the leaderboard SOLO column only — NOT lifetimePoints, NOT
 *      claimable (spending solo points is a planned future update).
 *  • Daily challenge / priority / kid games → recorded as attempts + streaks only.
 *      They do NOT write lifetimePoints or pointsLedger, so they affect neither
 *      the public leaderboard nor the claimable balance. (Phase 2 candidate.)
 *
 * ── Reward cost ladder ("premium, aspirational") ─────────────────────────────
 *  Costs are deliberately HIGH to drive desire (perceived value), charm-priced
 *  just under round numbers (left-digit effect), and anchored by a 2M Planner
 *  so the mid-tiers read as attainable by comparison. Tuned to the Kahoot-scale
 *  points (~hundreds per question). Rarity rises with cost:
 *   Eraser      (75,000)    COMMON    — the first realistic goal
 *   Pencil      (120,000)   COMMON
 *   Pen         (190,000)   RARE      — just under 200k (left-digit pull)
 *   Ruler       (280,000)   RARE
 *   Highlighter (420,000)   EPIC
 *   Notes       (600,000)   EPIC
 *   Notebook    (880,000)   LEGENDARY
 *   Kit         (1,350,000) LEGENDARY
 *   Planner     (2,000,000) MYTHIC    — the anchor / status trophy
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
  { id: 5, name: "Eraser",      nameKh: "ជ័រលុប",           cost: 75000,    color: "#a855f7", image: "/rewards/eraser.webp" },
  { id: 2, name: "Pencil",      nameKh: "ខ្មៅដៃ",           cost: 120000,   color: "#eab308", image: "/rewards/pencil.webp" },
  { id: 3, name: "Pen",         nameKh: "ប៊ិច",              cost: 190000,   color: "#22c55e", image: "/rewards/pen.webp" },
  { id: 4, name: "Ruler",       nameKh: "បន្ទាត់",           cost: 280000,   color: "#f97316", image: "/rewards/ruler.webp" },
  { id: 6, name: "Highlighter", nameKh: "ប៊ិចសម្គាល់",       cost: 420000,   color: "#ef4444", image: "/rewards/highlighter.webp" },
  { id: 7, name: "Notes",       nameKh: "ក្រដាសសម្គាល់",     cost: 600000,   color: "#06b6d4", image: "/rewards/notes.webp" },
  { id: 1, name: "Notebook",    nameKh: "សៀវភៅកត់ត្រា",      cost: 880000,   color: "#3b82f6", image: "/rewards/notebook.webp" },
  { id: 8, name: "Kit",         nameKh: "ឧបករណ៍គណិត",       cost: 1350000,  color: "#ec4899", image: "/rewards/kit.webp" },
  { id: 9, name: "Planner",     nameKh: "ផែនការសិក្សា",      cost: 2000000,  color: "#84cc16", image: "/rewards/planner.webp" },
];

/**
 * Rarity tier for a reward, derived from its cost. Drives the premium
 * collectible treatment on the card (ribbon colour, frame weight, label).
 */
export type RewardRarity = "common" | "rare" | "epic" | "legendary" | "mythic";

export function getRewardRarity(cost: number): RewardRarity {
  if (cost >= 1800000) return "mythic";
  if (cost >= 800000) return "legendary";
  if (cost >= 400000) return "epic";
  if (cost >= 180000) return "rare";
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
