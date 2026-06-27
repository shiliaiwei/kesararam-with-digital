import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { subscriptions } from "@/db/schema/subscriptions";
import { eq } from "drizzle-orm";
import {
  getStripe,
  isPurchasablePlan,
  priceIdFor,
  type BillingCycle,
} from "@/lib/stripe";

export const runtime = "nodejs";

/**
 * POST /api/stripe/checkout
 * Body: { plan: PurchasablePlan, cycle: "monthly" | "yearly" }
 * Returns: { url } — a Stripe Checkout Session URL to redirect to.
 */
export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: { plan?: string; cycle?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const plan = body.plan ?? "";
  let cycle = (body.cycle === "yearly" ? "yearly" : "monthly") as BillingCycle;
  if (plan === "family" || plan === "teacher_pro") {
    cycle = "yearly";
  }

  if (!isPurchasablePlan(plan)) {
    return NextResponse.json({ error: "Unknown plan" }, { status: 400 });
  }

  const priceId = priceIdFor(plan, cycle);
  if (!priceId) {
    return NextResponse.json(
      { error: "This plan is not available for card payment yet. Please use KHQR." },
      { status: 503 },
    );
  }

  const stripe = getStripe();

  // Reuse an existing Stripe customer if this user already has one.
  const existing = await db
    .select()
    .from(subscriptions)
    .where(eq(subscriptions.userId, session.id))
    .limit(1);

  let customerId = existing[0]?.stripeCustomerId ?? undefined;
  if (!customerId) {
    const customer = await stripe.customers.create({
      email: session.email,
      name: session.name,
      metadata: { userId: String(session.id) },
    });
    customerId = customer.id;
  }

  const origin =
    req.headers.get("origin") ||
    process.env.NEXT_PUBLIC_APP_URL ||
    "http://localhost:3000";

  const checkout = await stripe.checkout.sessions.create({
    mode: "subscription",
    customer: customerId,
    line_items: [{ price: priceId, quantity: 1 }],
    client_reference_id: String(session.id),
    metadata: { userId: String(session.id), plan, cycle },
    subscription_data: {
      metadata: { userId: String(session.id), plan, cycle },
    },
    allow_promotion_codes: true,
    success_url: `${origin}/pricing?status=success&session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${origin}/pricing?status=cancelled`,
  });

  return NextResponse.json({ url: checkout.url });
}
