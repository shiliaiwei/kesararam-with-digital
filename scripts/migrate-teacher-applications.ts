/**
 * Migration: teacher_applications table (plan-driven sign-up requests).
 * Idempotent — safe to run multiple times.
 *
 *   pnpm db:migrate-teacher-apps
 */
import { neon } from "@neondatabase/serverless";
import { config } from "dotenv";

config({ path: ".env.local" });

const dbUrl = (process.env.DATABASE_URL ?? "").replace(/^['"]+|['"]+$/g, "");
if (!dbUrl) throw new Error("DATABASE_URL is not set");

const sql = neon(dbUrl);

async function migrate() {
  console.log("→ Creating application_status enum (if missing)…");
  await sql`
    DO $$ BEGIN
      CREATE TYPE application_status AS ENUM ('pending', 'approved', 'rejected');
    EXCEPTION WHEN duplicate_object THEN NULL;
    END $$;
  `;

  console.log("→ Creating teacher_applications table…");
  await sql`
    CREATE TABLE IF NOT EXISTS teacher_applications (
      id SERIAL PRIMARY KEY,
      display_name TEXT NOT NULL,
      email TEXT NOT NULL,
      phone TEXT,
      school_name TEXT,
      province TEXT,
      plan plan_tier NOT NULL,
      billing_cycle TEXT NOT NULL,
      seats INTEGER,
      academy_name TEXT,
      note TEXT,
      status application_status NOT NULL DEFAULT 'pending',
      reviewed_by INTEGER REFERENCES users(id),
      reviewed_at TIMESTAMP,
      created_at TIMESTAMP NOT NULL DEFAULT now(),
      updated_at TIMESTAMP NOT NULL DEFAULT now()
    )
  `;

  console.log("→ Indexes…");
  await sql`CREATE INDEX IF NOT EXISTS teacher_apps_status_idx ON teacher_applications(status)`;
  await sql`CREATE INDEX IF NOT EXISTS teacher_apps_email_idx ON teacher_applications(email)`;

  console.log("✅ teacher_applications migration complete.");
}

migrate()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("❌ Migration failed:", err);
    process.exit(1);
  });
