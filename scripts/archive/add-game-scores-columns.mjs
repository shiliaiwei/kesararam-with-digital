import { neon } from "@neondatabase/serverless";
import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

const sql = neon(process.env.DATABASE_URL);

async function main() {
  console.log("Adding columns to game_scores table...");
  await sql`ALTER TABLE game_scores ADD COLUMN IF NOT EXISTS score_difference integer DEFAULT 0`;
  await sql`ALTER TABLE game_scores ADD COLUMN IF NOT EXISTS score_type text DEFAULT 'solo'`;
  await sql`ALTER TABLE game_scores ADD COLUMN IF NOT EXISTS game_type text`;
  console.log("Columns added successfully!");
  process.exit(0);
}

main().catch(err => {
  console.error("Migration failed:", err);
  process.exit(1);
});
