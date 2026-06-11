/**
 * Stripe server helpers — plan ↔ price mapping and a lazily-created client.
 *
 * Price IDs live in env (STRIPE_PRICE_*). During the launch promo these point
 * at the PROMO prices, which Stripe locks to each subscriber forever (matching
 * the "lock in $3/mo" marketing). In Jan 2027, new STANDARD prices get created
 * and these env vars repointed — existing subscribers keep their locked rate.
 */
import Stripe from "stripe";

let _stripe: Stripe | null = null;

/** Server-only Stripe client. Throws if the secret key is missing. */
export function getStripe(): Stripe {
  if (_stripe) return _stripe;
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error("STRIPE_SECRET_KEY is not set");
  _stripe = new Stripe(key, { typescript: true });
  return _stripe;
}

/** Plans a user can buy through Stripe (Free is not purchasable). */
export type PurchasablePlan = "family" | "teacher_pro" | "school" | "driving_school";
export type BillingCycle = "monthly" | "yearly";

/** plan → cycle → name of the env var holding the Stripe Price ID. */
const PRICE_ENV: Record<PurchasablePlan, Record<BillingCycle, string>> = {
  family: { monthly: "STRIPE_PRICE_FAMILY_MONTHLY", yearly: "STRIPE_PRICE_FAMILY_YEARLY" },
  teacher_pro: { monthly: "STRIPE_PRICE_TEACHER_MONTHLY", yearly: "STRIPE_PRICE_TEACHER_YEARLY" },
  school: { monthly: "STRIPE_PRICE_SCHOOL_MONTHLY", yearly: "STRIPE_PRICE_SCHOOL_YEARLY" },
  driving_school: { monthly: "STRIPE_PRICE_DRIVING_MONTHLY", yearly: "STRIPE_PRICE_DRIVING_YEARLY" },
};

export function isPurchasablePlan(x: string): x is PurchasablePlan {
  return x === "family" || x === "teacher_pro" || x === "school" || x === "driving_school";
}

/** Resolve the configured Stripe Price ID for a plan+cycle, or null if unset. */
export function priceIdFor(plan: PurchasablePlan, cycle: BillingCycle): string | null {
  const envName = PRICE_ENV[plan]?.[cycle];
  if (!envName) return null;
  return process.env[envName]?.trim() || null;
}

/** Reverse lookup used by the webhook: which plan/cycle does a price ID map to? */
export function planFromPriceId(
  priceId: string,
): { plan: PurchasablePlan; cycle: BillingCycle } | null {
  for (const plan of Object.keys(PRICE_ENV) as PurchasablePlan[]) {
    for (const cycle of ["monthly", "yearly"] as BillingCycle[]) {
      const configured = process.env[PRICE_ENV[plan][cycle]]?.trim();
      if (configured && configured === priceId) return { plan, cycle };
    }
  }
  return null;
}
