/**
 * Create the reward_claims table — the student→teacher reward fulfillment workflow.
 *
 * Idempotent: CREATE TABLE / INDEX IF NOT EXISTS, safe to re-run.
 *
 * Usage:
 *   npm run db:migrate-reward-claims
 */

import { config } from "dotenv";
config({ path: ".env.local" });
import { neon } from "@neondatabase/serverless";

const dbUrl = (process.env.DATABASE_URL ?? "").replace(/^['"]+|['"]+$/g, "");
if (!dbUrl) throw new Error("DATABASE_URL is not set");
const sql = neon(dbUrl);

async function main() {
  console.log("Creating reward_claims table (if not exists)…");

  await sql`
    CREATE TABLE IF NOT EXISTS reward_claims (
      id            SERIAL PRIMARY KEY,
      student_id    INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      class_id      INTEGER,
      teacher_id    INTEGER,
      item_id       INTEGER NOT NULL,
      item_name     TEXT NOT NULL,
      cost          INTEGER NOT NULL,
      status        TEXT NOT NULL DEFAULT 'pending',
      student_note  TEXT,
      teacher_note  TEXT,
      created_at    TIMESTAMP NOT NULL DEFAULT NOW(),
      decided_at    TIMESTAMP,
      decided_by    INTEGER,
      fulfilled_at  TIMESTAMP
    )
  `;

  await sql`
    CREATE INDEX IF NOT EXISTS reward_claims_student_idx
      ON reward_claims (student_id, created_at)
  `;
  await sql`
    CREATE INDEX IF NOT EXISTS reward_claims_teacher_status_idx
      ON reward_claims (teacher_id, status)
  `;

  const [{ count }] = (await sql`SELECT COUNT(*)::int AS count FROM reward_claims`) as { count: number }[];
  console.log(`Done. reward_claims ready (${count} existing rows).`);
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("Migration failed:", err);
    process.exit(1);
  });
