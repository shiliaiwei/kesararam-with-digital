import { neon } from "@neondatabase/serverless";
import { readFileSync } from "fs";

const env = readFileSync(".env.local", "utf8");
const url = env
  .match(/^DATABASE_URL=(.+)$/m)[1]
  .trim()
  .replace(/^['"]|['"]$/g, "");
const sql = neon(url);

// Test the exact SELECT Drizzle does during login
try {
  const r =
    await sql`SELECT * FROM users WHERE email = ${"srievi@kwd.tech"} OR username = ${"vi"} LIMIT 1`;
  console.log("Raw SELECT OK:", r[0]?.username, r[0]?.role);
} catch (e) {
  console.error("SELECT FAILED:", e.cause?.message ?? e.message);
}

// Check the role enum name
const enums = await sql`
  SELECT typname, enumlabel FROM pg_type t
  JOIN pg_enum e ON t.oid = e.enumtypid
  WHERE typname LIKE '%role%'
  ORDER BY typname, e.enumsortorder
`;
console.log("\nRole enums in DB:");
enums.forEach((e) => console.log(e.typname, "->", e.enumlabel));
