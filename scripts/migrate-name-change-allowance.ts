/**
 * Adds users.can_change_name_once — a one-time allowance letting a user change
 * their full name + username ONCE, bypassing the 60-day post-signup cooldown.
 * Consumed on the next name/username change; normal cooldowns then resume.
 *
 * Also RESETS the allowance for the Grade-5 / JVNUPL class only: grants the
 * one-time change and clears username_changed_at so their first change isn't
 * blocked by the 1-year username cooldown.
 *
 * Idempotent: ADD COLUMN IF NOT EXISTS; the reset is safe to re-run.
 */
import { config } from "dotenv";
config({ path: ".env.local" });
import { neon } from "@neondatabase/serverless";

const CLASS_CODE = "JVNUPL";
const dbUrl = (process.env.DATABASE_URL ?? "").replace(/^['"]+|['"]+$/g, "");
if (!dbUrl) throw new Error("DATABASE_URL is not set");
const sql = neon(dbUrl);

async function migrate() {
  console.log("Adding users.can_change_name_once …");
  await sql`
    ALTER TABLE users
    ADD COLUMN IF NOT EXISTS can_change_name_once BOOLEAN DEFAULT false NOT NULL
  `;

  const [cls] = await sql`SELECT id FROM classes WHERE code = ${CLASS_CODE} LIMIT 1`;
  if (!cls) {
    console.warn(`Class ${CLASS_CODE} not found — column added, no students reset.`);
    return;
  }

  const reset = await sql`
    UPDATE users
    SET can_change_name_once = true, username_changed_at = NULL
    WHERE id IN (
      SELECT student_id FROM class_enrollments WHERE class_id = ${cls.id}
    )
    RETURNING id
  `;
  console.log(`Granted one-time name/username change to ${reset.length} ${CLASS_CODE} students.`);
  console.log("✅ Migration completed.");
}

migrate().catch((e) => { console.error("❌ Migration failed:", e); process.exit(1); });
