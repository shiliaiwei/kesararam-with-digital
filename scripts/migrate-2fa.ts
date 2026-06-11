/**
 * Migration: 2FA (TOTP) columns on users.
 * Idempotent — safe to run multiple times.
 *
 *   pnpm db:migrate-2fa
 */
import { neon } from "@neondatabase/serverless";
import { config } from "dotenv";

config({ path: ".env.local" });

const dbUrl = (process.env.DATABASE_URL ?? "").replace(/^['"]+|['"]+$/g, "");
if (!dbUrl) throw new Error("DATABASE_URL is not set");

const sql = neon(dbUrl);

async function migrate() {
  console.log("→ Adding 2FA columns to users…");
  await sql`
    ALTER TABLE users
      ADD COLUMN IF NOT EXISTS two_factor_enabled BOOLEAN NOT NULL DEFAULT false,
      ADD COLUMN IF NOT EXISTS two_factor_secret TEXT,
      ADD COLUMN IF NOT EXISTS two_factor_backup_codes TEXT,
      ADD COLUMN IF NOT EXISTS two_factor_enrolled_at TIMESTAMP
  `;
  console.log("✅ 2FA migration complete.");
}

migrate()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("❌ Migration failed:", err);
    process.exit(1);
  });
