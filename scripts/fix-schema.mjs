import { neon } from "@neondatabase/serverless";
import { readFileSync } from "fs";

const env = readFileSync(".env.local", "utf8");
const url = env
  .match(/^DATABASE_URL=(.+)$/m)[1]
  .trim()
  .replace(/^['"]|['"]$/g, "");
const sql = neon(url);

const cols = await sql`
  SELECT column_name, data_type, character_maximum_length, is_nullable, column_default
  FROM information_schema.columns
  WHERE table_name = 'users'
  ORDER BY ordinal_position
`;
console.log("=== users columns with lengths ===");
cols.forEach((c) =>
  console.log(
    c.column_name.padEnd(22),
    (
      c.data_type +
      (c.character_maximum_length ? `(${c.character_maximum_length})` : "")
    ).padEnd(30),
    c.is_nullable.padEnd(4),
  ),
);

// Also fix: ALTER the avatar column to TEXT
console.log("\nAltering columns to remove length limits...");
try {
  await sql`ALTER TABLE users ALTER COLUMN avatar TYPE TEXT`;
  console.log("✓ avatar → TEXT");
} catch (e) {
  console.error("avatar:", e.cause?.message ?? e.message);
}

try {
  await sql`ALTER TABLE users ALTER COLUMN display_name TYPE TEXT`;
  console.log("✓ display_name → TEXT");
} catch (e) {
  console.error("display_name:", e.cause?.message ?? e.message);
}

try {
  await sql`ALTER TABLE users ALTER COLUMN username TYPE TEXT`;
  console.log("✓ username → TEXT");
} catch (e) {
  console.error("username:", e.cause?.message ?? e.message);
}

try {
  await sql`ALTER TABLE users ALTER COLUMN email TYPE TEXT`;
  console.log("✓ email → TEXT");
} catch (e) {
  console.error("email:", e.cause?.message ?? e.message);
}

// Verify
const cols2 = await sql`
  SELECT column_name, data_type, character_maximum_length
  FROM information_schema.columns
  WHERE table_name = 'users' AND column_name IN ('avatar','display_name','username','email')
  ORDER BY ordinal_position
`;
console.log("\n=== after alter ===");
cols2.forEach((c) =>
  console.log(
    c.column_name.padEnd(22),
    c.data_type,
    c.character_maximum_length ?? "(unlimited)",
  ),
);
