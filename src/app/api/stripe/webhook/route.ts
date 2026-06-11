import { NextRequest, NextResponse } from "next/server";
import type Stripe from "stripe";
import { db } from "@/lib/db";
import { subscriptions } from "@/db/schema/subscriptions";
import { eq } from "drizzle-orm";
import { getStripe, planFromPriceId, type PurchasablePlan } from "@/lib/stripe";

export const runtime = "nodejs";

type SubStatus = "active" | "expired" | "cancelled" | "trial";

function mapStatus(stripeStatus: string): SubStatus {
  switch (stripeStatus) {
    case "active":
      return "active";
    case "trialing":
      return "trial";
    case "canceled":
      return "cancelled";
    default:
      // past_due, unpaid, incomplete, incomplete_expired, paused
      return "expired";
  }
}

/**
 * Upsert the user's subscription row from Stripe data.
 * assignedBy is set to the user themselves (self-purchase) since there's no admin.
 */
async function applySubscription(opts: {
  userId: number;
  plan: PurchasablePlan | "free";
  status: SubStatus;
  stripeCustomerId?: string | null;
  stripeSubscriptionId?: string | null;
  stripePriceId?: string | null;
  billingCycle?: string | null;
}) {
  const existing = await db
    .select()
    .from(subscriptions)
    .where(eq(subscriptions.userId, opts.userId))
    .limit(1);

  const values = {
    plan: opts.plan,
    status: opts.status,
    stripeCustomerId: opts.stripeCustomerId ?? null,
    stripeSubscriptionId: opts.stripeSubscriptionId ?? null,
    stripePriceId: opts.stripePriceId ?? null,
    billingCycle: opts.billingCycle ?? null,
    updatedAt: new Date(),
  };

  if (existing[0]) {
    await db
      .update(subscriptions)
      .set(values)
      .where(eq(subscriptions.id, existing[0].id));
  } else {
    await db.insert(subscriptions).values({
      userId: opts.userId,
      assignedBy: opts.userId, // self-purchase via Stripe
      startsAt: new Date(),
      note: "Stripe card checkout",
      ...values,
    });
  }
}

export async function POST(req: NextRequest) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret) {
    return NextResponse.json({ error: "Webhook not configured" }, { status: 503 });
  }

  const sig = req.headers.get("stripe-signature");
  if (!sig) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  const raw = await req.text();
  const stripe = getStripe();

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(raw, sig, secret);
  } catch (err) {
    console.error("Stripe webhook signature verification failed:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const s = event.data.object as Stripe.Checkout.Session;
        const userId = Number(s.client_reference_id || s.metadata?.userId);
        const plan = s.metadata?.plan as PurchasablePlan | undefined;
        const cycle = s.metadata?.cycle ?? null;
        if (!userId || !plan) break;

        // Resolve the price id from the subscription's first line item if possible.
        let priceId: string | null = null;
        if (typeof s.subscription === "string") {
          const sub = await stripe.subscriptions.retrieve(s.subscription);
          priceId = sub.items.data[0]?.price.id ?? null;
        }

        await applySubscription({
          userId,
          plan,
          status: "active",
          stripeCustomerId: typeof s.customer === "string" ? s.customer : null,
          stripeSubscriptionId: typeof s.subscription === "string" ? s.subscription : null,
          stripePriceId: priceId,
          billingCycle: cycle,
        });
        break;
      }

      case "customer.subscription.updated": {
        const sub = event.data.object as Stripe.Subscription;
        const userId = Number(sub.metadata?.userId);
        if (!userId) break;
        const priceId = sub.items.data[0]?.price.id ?? null;
        const resolved = priceId ? planFromPriceId(priceId) : null;
        await applySubscription({
          userId,
          plan: resolved?.plan ?? (sub.metadata?.plan as PurchasablePlan) ?? "free",
          status: mapStatus(sub.status),
          stripeCustomerId: typeof sub.customer === "string" ? sub.customer : null,
          stripeSubscriptionId: sub.id,
          stripePriceId: priceId,
          billingCycle: resolved?.cycle ?? sub.metadata?.cycle ?? null,
        });
        break;
      }

      case "customer.subscription.deleted": {
        const sub = event.data.object as Stripe.Subscription;
        const userId = Number(sub.metadata?.userId);
        if (!userId) break;
        // Revoke access — drop back to free.
        await applySubscription({
          userId,
          plan: "free",
          status: "cancelled",
          stripeCustomerId: typeof sub.customer === "string" ? sub.customer : null,
          stripeSubscriptionId: sub.id,
        });
        break;
      }

      default:
        // Unhandled event types are acknowledged so Stripe stops retrying.
        break;
    }
  } catch (err) {
    console.error("Stripe webhook handler error:", err);
    return NextResponse.json({ error: "Handler error" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
