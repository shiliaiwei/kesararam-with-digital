import { neon } from "@neondatabase/serverless";
import { config } from "dotenv";

config({ path: ".env.local" });

const dbUrl = (process.env.DATABASE_URL ?? "").replace(/^['"]+|['"]+$/g, "");
if (!dbUrl) throw new Error("DATABASE_URL is not set");

const sql = neon(dbUrl);

async function migrate() {
  try {
    console.log("Running migration: add_language_to_game_sessions");
    
    await sql`
      ALTER TABLE game_sessions 
      ADD COLUMN IF NOT EXISTS language VARCHAR(10) DEFAULT 'both' NOT NULL
    `;
    
    console.log("✅ Migration completed successfully!");
  } catch (error) {
    console.error("❌ Migration failed:", error);
    process.exit(1);
  }
}

migrate();
