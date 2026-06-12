/**
 * Reward catalog — the SINGLE source of truth for claimable store items.
 *
 * Imported by both the claim API (src/app/api/user/claim/route.ts) and the
 * leaderboard UI (src/app/(public)/leaderboard/page.tsx) so costs can never
 * drift between the two.
 *
 * ── Points Economy (2025 term) ────────────────────────────────────────────────
 *  • Live teacher game  → 15–40 pts per session (teacher-verified, competitive)
 *  • Solo practice game → 5–15 pts per session  (self-paced, practice-only)
 *  • Daily challenge    → 5–10 pts per day       (5 questions, once per day)
 *
 * ── Reward cost ladder ("premium, aspirational") ─────────────────────────────
 *  Costs are deliberately HIGH to drive desire (perceived value), charm-priced
 *  just under round numbers (left-digit effect), and anchored by a 20k Planner
 *  so the mid-tiers read as attainable by comparison. Rarity rises with cost:
 *   Eraser      (750)    COMMON    — the first realistic goal
 *   Pencil      (1,200)  COMMON
 *   Pen         (1,900)  RARE      — just under 2k (left-digit pull)
 *   Ruler       (2,800)  RARE
 *   Highlighter (4,200)  EPIC
 *   Notes       (6,000)  EPIC
 *   Notebook    (8,800)  LEGENDARY
 *   Kit         (13,500) LEGENDARY
 *   Planner     (20,000) MYTHIC    — the anchor / status trophy
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
  { id: 5, name: "Eraser",      nameKh: "ជ័រលុប",           cost: 750,    color: "#a855f7", image: "/rewards/eraser.webp" },
  { id: 2, name: "Pencil",      nameKh: "ខ្មៅដៃ",           cost: 1200,   color: "#eab308", image: "/rewards/pencil.webp" },
  { id: 3, name: "Pen",         nameKh: "ប៊ិច",              cost: 1900,   color: "#22c55e", image: "/rewards/pen.webp" },
  { id: 4, name: "Ruler",       nameKh: "បន្ទាត់",           cost: 2800,   color: "#f97316", image: "/rewards/ruler.webp" },
  { id: 6, name: "Highlighter", nameKh: "ប៊ិចសម្គាល់",       cost: 4200,   color: "#ef4444", image: "/rewards/highlighter.webp" },
  { id: 7, name: "Notes",       nameKh: "ក្រដាសសម្គាល់",     cost: 6000,   color: "#06b6d4", image: "/rewards/notes.webp" },
  { id: 1, name: "Notebook",    nameKh: "សៀវភៅកត់ត្រា",      cost: 8800,   color: "#3b82f6", image: "/rewards/notebook.webp" },
  { id: 8, name: "Kit",         nameKh: "ឧបករណ៍គណិត",       cost: 13500,  color: "#ec4899", image: "/rewards/kit.webp" },
  { id: 9, name: "Planner",     nameKh: "ផែនការសិក្សា",      cost: 20000,  color: "#84cc16", image: "/rewards/planner.webp" },
];

/**
 * Rarity tier for a reward, derived from its cost. Drives the premium
 * collectible treatment on the card (ribbon colour, frame weight, label).
 */
export type RewardRarity = "common" | "rare" | "epic" | "legendary" | "mythic";

export function getRewardRarity(cost: number): RewardRarity {
  if (cost >= 18000) return "mythic";
  if (cost >= 8000) return "legendary";
  if (cost >= 4000) return "epic";
  if (cost >= 1800) return "rare";
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
