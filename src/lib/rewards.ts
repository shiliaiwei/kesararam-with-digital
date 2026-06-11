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
 * ── Reward cost ladder ("term-long, achievable") ─────────────────────────────
 *  Each tier requires SIGNIFICANTLY more effort. Claiming is deliberately hard:
 *   Eraser   (400 pts)  ≈ 50–80 live games   | 2–4 weeks of active daily play
 *   Pencil   (600 pts)  ≈ 75–100 live games  | 3–6 weeks
 *   Pen      (900 pts)  ≈ 120 live games     | 6–8 weeks
 *   Ruler    (1,200 pts)≈ 150–200 live games | ~1.5 months
 *   Highlighter(1,800)  ≈ 230 live games     | ~2 months
 *   Notes    (2,500 pts)≈ 1 full term        | persistent daily play
 *   Notebook (3,500 pts)≈ 440 live games     | dedicated term-long
 *   Kit      (5,500 pts)≈ 700 live games     | elite effort
 *   Planner  (8,000 pts)≈ full term multiple | legendary achievement
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
  { id: 5, name: "Eraser",      nameKh: "ជ័រលុប",           cost: 400,   color: "#a855f7", image: "/rewards/eraser.webp" },
  { id: 2, name: "Pencil",      nameKh: "ខ្មៅដៃ",           cost: 600,   color: "#eab308", image: "/rewards/pencil.webp" },
  { id: 3, name: "Pen",         nameKh: "ប៊ិច",              cost: 900,   color: "#22c55e", image: "/rewards/pen.webp" },
  { id: 4, name: "Ruler",       nameKh: "បន្ទាត់",           cost: 1200,  color: "#f97316", image: "/rewards/ruler.webp" },
  { id: 6, name: "Highlighter", nameKh: "ប៊ិចសម្គាល់",       cost: 1800,  color: "#ef4444", image: "/rewards/highlighter.webp" },
  { id: 7, name: "Notes",       nameKh: "ក្រដាសសម្គាល់",     cost: 2500,  color: "#06b6d4", image: "/rewards/notes.webp" },
  { id: 1, name: "Notebook",    nameKh: "សៀវភៅកត់ត្រា",      cost: 3500,  color: "#3b82f6", image: "/rewards/notebook.webp" },
  { id: 8, name: "Kit",         nameKh: "ឧបករណ៍គណិត",       cost: 5500,  color: "#ec4899", image: "/rewards/kit.webp" },
  { id: 9, name: "Planner",     nameKh: "ផែនការសិក្សា",      cost: 8000,  color: "#84cc16", image: "/rewards/planner.webp" },
];

/** Look up a reward by id (used by the claim API to validate cost). */
export function getRewardItem(id: number): RewardItem | undefined {
  return REWARD_ITEMS.find((r) => r.id === id);
}
