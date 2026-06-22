import { config } from "dotenv";
config({ path: ".env.local" });

import { neon } from "@neondatabase/serverless";

const CLASS_CODE = "NSKAFL";
const WINDOW_DAYS = 7;

const dbUrl = (process.env.DATABASE_URL ?? "").replace(/^['"]+|['"]+$/g, "");
if (!dbUrl) throw new Error("DATABASE_URL is not set");

const sql = neon(dbUrl);

async function main() {
  await sql`
    ALTER TABLE users
    ADD COLUMN IF NOT EXISTS profile_edit_unlocked_until TIMESTAMP
  `;

  const [targetClass] = await sql`
    SELECT id, code, name
    FROM classes
    WHERE code = ${CLASS_CODE}
    LIMIT 1
  `;

  if (!targetClass) {
    throw new Error(`Class ${CLASS_CODE} was not found`);
  }

  const updated = await sql`
    UPDATE users
    SET profile_edit_unlocked_until = now() + (${WINDOW_DAYS} || ' days')::interval,
        updated_at = now()
    WHERE role = 'student'
      AND id IN (
        SELECT student_id
        FROM class_enrollments
        WHERE class_id = ${targetClass.id}
      )
    RETURNING id, username, display_name, profile_edit_unlocked_until
  `;

  console.log(`Granted ${WINDOW_DAYS}-day profile edit window to ${updated.length} ${CLASS_CODE} students.`);
  console.log(`Class: ${targetClass.name} (${targetClass.code})`);
  console.log(`Expires at: ${updated[0]?.profile_edit_unlocked_until ?? "n/a"}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
