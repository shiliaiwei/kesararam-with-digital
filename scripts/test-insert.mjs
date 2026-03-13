import { neon } from "@neondatabase/serverless";
import { readFileSync } from "fs";

const env = readFileSync(".env.local", "utf8");
const url = env
  .match(/^DATABASE_URL=(.+)$/m)[1]
  .trim()
  .replace(/^['"]|['"]$/g, "");
const sql = neon(url);

// Test 1: raw INSERT
try {
  const r =
    await sql`INSERT INTO users (username, email, password_hash, role, is_active, login_attempts) VALUES ('__diag__', '__diag@kwd.tech', 'hash', 'student', true, 0) RETURNING id`;
  console.log("raw INSERT OK:", r[0]);
  await sql`DELETE FROM users WHERE username = '__diag__'`;
  console.log("cleaned up");
} catch (e) {
  console.error("raw INSERT FAILED:", e.message);
}
