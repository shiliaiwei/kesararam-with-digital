import { neon } from "@neondatabase/serverless";
import { config } from "dotenv";

config({ path: ".env.local" });

const dbUrl = (process.env.DATABASE_URL ?? "").replace(/^['"]+|['"]+$/g, "");
if (!dbUrl) throw new Error("DATABASE_URL not set");

const sql = neon(dbUrl);

async function migrate() {
  console.log("Running subscription migration...");

  // Create enums (ignore if already exist)
  try {
    await sql`CREATE TYPE "plan_tier" AS ENUM ('free', 'teacher_pro', 'school')`;
    console.log("✓ plan_tier enum created");
  } catch (e: any) {
    console.log("  plan_tier:", e.message.includes("already exists") ? "already exists" : e.message);
  }

  try {
    await sql`CREATE TYPE "subscription_status" AS ENUM ('active', 'expired', 'cancelled', 'trial')`;
    console.log("✓ subscription_status enum created");
  } catch (e: any) {
    console.log("  subscription_status:", e.message.includes("already exists") ? "already exists" : e.message);
  }

  // Create table
  try {
    await sql`
      CREATE TABLE IF NOT EXISTS "subscriptions" (
        "id" serial PRIMARY KEY NOT NULL,
        "user_id" integer NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
        "plan" "plan_tier" NOT NULL DEFAULT 'free',
        "status" "subscription_status" NOT NULL DEFAULT 'active',
        "is_trial" boolean NOT NULL DEFAULT false,
        "trial_ends_at" timestamp,
        "starts_at" timestamp NOT NULL DEFAULT now(),
        "ends_at" timestamp,
        "assigned_by" integer NOT NULL REFERENCES "users"("id"),
        "note" text,
        "created_at" timestamp NOT NULL DEFAULT now(),
        "updated_at" timestamp NOT NULL DEFAULT now()
      )
    `;
    console.log("✓ subscriptions table created");
  } catch (e: any) {
    console.log("  table:", e.message);
  }

  // Create indexes
  try {
    await sql`CREATE INDEX IF NOT EXISTS "subscriptions_user_id_idx" ON "subscriptions"("user_id")`;
    await sql`CREATE INDEX IF NOT EXISTS "subscriptions_status_idx" ON "subscriptions"("status")`;
    console.log("✓ indexes created");
  } catch (e: any) {
    console.log("  indexes:", e.message);
  }

  // Verify
  try {
    const rows = await sql`SELECT COUNT(*) FROM "subscriptions"`;
    console.log("✓ table verified, rows:", rows[0].count);
  } catch (e: any) {
    console.log("✗ verification failed:", e.message);
  }

  console.log("Done.");
}

migrate().catch(console.error);
