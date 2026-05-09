import { neon } from "@neondatabase/serverless";
import { config } from "dotenv";

config({ path: ".env.local" });

const dbUrl = (process.env.DATABASE_URL ?? "").replace(/^['"]+|['"]+$/g, "");
if (!dbUrl) throw new Error("DATABASE_URL is not set");

const sql = neon(dbUrl);

async function migrate() {
  try {
    console.log("Running migration: add_user_game_stats.sql");
    
    // Run each statement separately
    await sql`
      ALTER TABLE users 
      ADD COLUMN IF NOT EXISTS highest_score INTEGER DEFAULT 0 NOT NULL,
      ADD COLUMN IF NOT EXISTS total_games_played INTEGER DEFAULT 0 NOT NULL,
      ADD COLUMN IF NOT EXISTS lifetime_points INTEGER DEFAULT 0 NOT NULL
    `;
    
    await sql`CREATE INDEX IF NOT EXISTS users_highest_score_idx ON users(highest_score DESC)`;
    await sql`CREATE INDEX IF NOT EXISTS users_lifetime_points_idx ON users(lifetime_points DESC)`;
    
    console.log("✅ Migration completed successfully!");
  } catch (error) {
    console.error("❌ Migration failed:", error);
    process.exit(1);
  }
}

migrate();
