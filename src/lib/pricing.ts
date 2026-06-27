/**
 * KWD pricing — SINGLE SOURCE OF TRUTH.
 *
 * Pure data, NO database / server imports. Safe in client and server.
 * Both the public /pricing page and the admin "Assign License" flow read from
 * here so the numbers can never drift apart.
 *
 * Promo window runs through end of 2026 (mirrors the marketing page). While the
 * promo is active, `promo*` is the effective charge and `std*` is the
 * struck-through anchor price.
 */

import type { PlanTier } from "./subscription-plans";

/** Plans an admin can sell / a user can buy (excludes "free"). */
export type PaidPlan = "family" | "teacher_pro" | "school" | "driving_school";

export type BillingCycle = "monthly" | "yearly";

/**
 * USD prices. promoM/stdM = monthly · promoY/stdY = yearly.
 * Values are the canonical KWD price list (also shown on /pricing).
 */
export const PRICES: Record<PaidPlan, { promoM: number; stdM: number; promoY: number; stdY: number }> = {
  family:         { promoM: 2,  stdM: 5,  promoY: 2,   stdY: 5 },
  teacher_pro:    { promoM: 3,  stdM: 10, promoY: 3,   stdY: 10 },
  school:         { promoM: 6,  stdM: 20, promoY: 54,  stdY: 180 },
  driving_school: { promoM: 11, stdM: 35, promoY: 110, stdY: 350 },
};

/** Launch-promo window. Effective charge = promo while `now` is inside it. */
export const PROMO_START = "2026-01-01T00:00:00";
export const PROMO_END = "2026-12-31T23:59:59";

export function isPromoActive(now: Date = new Date()): boolean {
  const t = now.getTime();
  return t >= new Date(PROMO_START).getTime() && t <= new Date(PROMO_END).getTime();
}

/** Per-plan display metadata for pickers & badges (material-symbol icon names). */
export const PLAN_META: Record<PaidPlan, {
  name: string;
  nameKh: string;
  icon: string;
  color: string;
  blurb: string;
}> = {
  family:         { name: "Family",         nameKh: "គ្រួសារ",              icon: "group",          color: "#3b82f6", blurb: "Up to 9 children" },
  teacher_pro:    { name: "Teacher Pro",    nameKh: "គ្រូ Pro",            icon: "crown",          color: "#f59e0b", blurb: "Unlimited sessions" },
  school:         { name: "School",         nameKh: "សាលា",                icon: "domain",         color: "#a855f7", blurb: "Up to 10 teachers" },
  driving_school: { name: "Driving School", nameKh: "សាលាបង្រៀនបើកបរ",      icon: "directions_car", color: "#10b981", blurb: "Unlimited learners" },
};

export const PAID_PLANS: PaidPlan[] = ["family", "teacher_pro", "school", "driving_school"];

/** Effective charge for a plan + cycle (promo while active, else standard). */
export function getPlanPrice(plan: PaidPlan, cycle: BillingCycle, opts?: { promo?: boolean }): number {
  const p = PRICES[plan];
  const promo = opts?.promo ?? isPromoActive();
  const targetCycle = (plan === "family" || plan === "teacher_pro") ? "yearly" : cycle;
  if (targetCycle === "yearly") return promo ? p.promoY : p.stdY;
  return promo ? p.promoM : p.stdM;
}

/** Standard (non-promo) anchor price — what the promo is discounted from. */
export function getStandardPrice(plan: PaidPlan, cycle: BillingCycle): number {
  const targetCycle = (plan === "family" || plan === "teacher_pro") ? "yearly" : cycle;
  return targetCycle === "yearly" ? PRICES[plan].stdY : PRICES[plan].stdM;
}

/** "$24/yr" style label for the effective charge. */
export function formatPriceLabel(plan: PaidPlan, cycle: BillingCycle, opts?: { promo?: boolean }): string {
  const targetCycle = (plan === "family" || plan === "teacher_pro") ? "yearly" : cycle;
  const usd = getPlanPrice(plan, targetCycle, opts);
  return `$${usd}/${targetCycle === "yearly" ? "12 mo" : "mo"}`;
}

/**
 * Compute the renewal/end date for a paid license.
 * monthly → +1 calendar month, yearly → +1 calendar year, from `start`.
 * Returns an ISO string.
 */
export function computeEndsAt(start: Date | string, cycle: BillingCycle): string {
  const d = new Date(start);
  if (cycle === "yearly") d.setFullYear(d.getFullYear() + 1);
  else d.setMonth(d.getMonth() + 1);
  return d.toISOString();
}

/** Whether a tier is a sellable paid plan. */
export function isPaidPlan(plan: string): plan is PaidPlan {
  return (PAID_PLANS as string[]).includes(plan);
}

export type { PlanTier };
