import { neon } from "@neondatabase/serverless";
import { config } from "dotenv";

config({ path: ".env.local" });

const databaseUrl = (process.env.DATABASE_URL ?? "").replace(/^['"]+|['"]+$/g, "");
if (!databaseUrl) throw new Error("DATABASE_URL is not set");

const sql = neon(databaseUrl);

async function migrate() {
  await sql`
    ALTER TABLE users
    ADD COLUMN IF NOT EXISTS score_plate_style TEXT DEFAULT 'road' NOT NULL
  `;
  await sql`
    UPDATE users
    SET score_plate_style = 'road'
    WHERE score_plate_style NOT IN ('road', 'garden', 'sky', 'rose')
  `;
  console.log("Score plate styles migration complete.");
}

migrate().catch((error) => {
  console.error("Score plate styles migration failed:", error);
  process.exit(1);
});
