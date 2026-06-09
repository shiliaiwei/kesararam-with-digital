/**
 * Migration: Stripe subscriptions support.
 * - Adds "family" and "driving_school" to the plan_tier enum.
 * - Adds Stripe linkage columns to the subscriptions table.
 * Idempotent — safe to run multiple times.
 *
 *   pnpm db:migrate-stripe
 */
import { neon } from "@neondatabase/serverless";
import { config } from "dotenv";

config({ path: ".env.local" });

const dbUrl = (process.env.DATABASE_URL ?? "").replace(/^['"]+|['"]+$/g, "");
if (!dbUrl) throw new Error("DATABASE_URL is not set");

const sql = neon(dbUrl);

async function migrate() {
  console.log("→ Adding new plan_tier enum values…");
  // ADD VALUE cannot run inside a transaction; neon runs each call autocommit.
  await sql`ALTER TYPE plan_tier ADD VALUE IF NOT EXISTS 'family'`;
  await sql`ALTER TYPE plan_tier ADD VALUE IF NOT EXISTS 'driving_school'`;

  console.log("→ Adding Stripe columns to subscriptions…");
  await sql`
    ALTER TABLE subscriptions
      ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT,
      ADD COLUMN IF NOT EXISTS stripe_subscription_id TEXT,
      ADD COLUMN IF NOT EXISTS stripe_price_id TEXT,
      ADD COLUMN IF NOT EXISTS billing_cycle TEXT
  `;

  console.log("→ Index for fast webhook lookups by Stripe subscription id…");
  await sql`
    CREATE INDEX IF NOT EXISTS subscriptions_stripe_sub_idx
      ON subscriptions(stripe_subscription_id)
  `;

  console.log("✅ Stripe migration complete.");
}

migrate()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("❌ Migration failed:", err);
    process.exit(1);
  });
