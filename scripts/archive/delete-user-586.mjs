/**
 * Delete user id=586 (teacher) with cascade handling.
 * Reassigns their classes to srievi (id=2) before deleting.
 * Run: node scripts/delete-user-586.mjs
 */
import { neon } from "@neondatabase/serverless";
import { readFileSync } from "fs";

const env = readFileSync(".env.local", "utf8");
const url = env.match(/^DATABASE_URL=(.+)$/m)[1].trim().replace(/^['"]|['"]$/g, "");
const sql = neon(url);

const TARGET_ID = 586;
const FALLBACK_TEACHER_ID = 2; // srievi

async function main() {
  console.log(`→ Inspecting user #${TARGET_ID}...`);
  const [user] = await sql`SELECT id, username, display_name, role FROM users WHERE id = ${TARGET_ID}`;
  if (!user) { console.log("User not found."); return; }
  console.log(`   Found: #${user.id} ${user.username} (${user.display_name ?? "—"}) — ${user.role}`);

  // 1. Reassign classes where this teacher is the teacher_id
  const classes = await sql`UPDATE classes SET teacher_id = ${FALLBACK_TEACHER_ID} WHERE teacher_id = ${TARGET_ID} RETURNING id`;
  console.log(`→ Reassigned ${classes.length} class(es) to fallback teacher #${FALLBACK_TEACHER_ID}`);

  // 2. Remove class_members/enrollments for this user
  const memberships = await sql`DELETE FROM class_members WHERE user_id = ${TARGET_ID} RETURNING id`;
  console.log(`→ Removed ${memberships.length} class membership(s)`);

  // 3. Delete subscriptions
  const subs = await sql`DELETE FROM subscriptions WHERE user_id = ${TARGET_ID} RETURNING id`;
  console.log(`→ Deleted ${subs.length} subscription(s)`);

  // 4. Delete sessions
  try {
    const sess = await sql`DELETE FROM sessions WHERE user_id = ${TARGET_ID} RETURNING id`;
    console.log(`→ Deleted ${sess.length} session(s)`);
  } catch { console.log("→ No sessions table or no sessions"); }

  // 5. Now delete the user
  const del = await sql`DELETE FROM users WHERE id = ${TARGET_ID} RETURNING id, username`;
  if (del.length) console.log(`\n✅ Deleted user #${del[0].id} (${del[0].username}) successfully.`);
  else console.log("⚠️  User already gone.");
}

main().then(() => process.exit(0)).catch((e) => { console.error("FAILED:", e.message); process.exit(1); });
