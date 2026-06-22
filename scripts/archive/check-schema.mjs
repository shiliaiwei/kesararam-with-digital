import { neon } from "@neondatabase/serverless";
import { readFileSync } from "fs";

// Load DATABASE_URL from .env.local
const envContent = readFileSync(".env.local", "utf8");
const match = envContent.match(/^DATABASE_URL=(.+)$/m);
const url = match[1].trim().replace(/^['"]|['"]$/g, "");

const sql = neon(url);

const cols = await sql`
  SELECT column_name, data_type, is_nullable, column_default
  FROM information_schema.columns
  WHERE table_name = 'users'
  ORDER BY ordinal_position
`;
console.log("=== users table columns ===");
cols.forEach((c) =>
  console.log(
    c.column_name.padEnd(22),
    c.data_type.padEnd(22),
    c.is_nullable.padEnd(5),
    (c.column_default ?? "").substring(0, 40),
  ),
);

const tables = await sql`
  SELECT table_name FROM information_schema.tables
  WHERE table_schema = 'public' ORDER BY table_name
`;
console.log("\n=== tables ===");
tables.forEach((t) => console.log(t.table_name));
