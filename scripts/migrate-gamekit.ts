import { neon } from "@neondatabase/serverless";
import { config } from "dotenv";

config({ path: ".env.local" });

const dbUrl = (process.env.DATABASE_URL ?? "").replace(/^['"]+|['"]+$/g, "");
if (!dbUrl) throw new Error("DATABASE_URL is not set");

const sql = neon(dbUrl);

/**
 * Idempotent migration for the traffic-game-kit tables.
 * Safe to run multiple times (uses IF NOT EXISTS).
 *   - daily_attempts   (anti-replay: unique(user_id, challenge_date))
 *   - priority_scenes  (Who Goes First? scenes; correct_order is server-only)
 *   - game_attempts    (generic kid/other GameKit plays)
 *   - points_ledger    (per-play points rows for weekly/monthly leaderboards)
 */
async function migrate() {
    try {
        console.log("GameKit migration: daily_attempts");
        await sql`
      CREATE TABLE IF NOT EXISTS daily_attempts (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        challenge_date TEXT NOT NULL,
        set_id INTEGER NOT NULL REFERENCES daily_challenge_sets(id),
        score INTEGER DEFAULT 0 NOT NULL,
        correct_count INTEGER DEFAULT 0 NOT NULL,
        total_questions INTEGER DEFAULT 5 NOT NULL,
        streak_after INTEGER DEFAULT 0 NOT NULL,
        breakdown TEXT,
        created_at TIMESTAMP DEFAULT now() NOT NULL,
        CONSTRAINT daily_attempts_user_date_unique UNIQUE (user_id, challenge_date)
      )
    `;

        console.log("GameKit migration: priority_scenes");
        await sql`
      CREATE TABLE IF NOT EXISTS priority_scenes (
        id SERIAL PRIMARY KEY,
        topic_id INTEGER REFERENCES topics(id) ON DELETE SET NULL,
        title_en TEXT DEFAULT '' NOT NULL,
        title_km TEXT DEFAULT '' NOT NULL,
        layout TEXT NOT NULL,
        correct_order TEXT NOT NULL,
        explanation_en TEXT DEFAULT '' NOT NULL,
        explanation_km TEXT DEFAULT '' NOT NULL,
        difficulty TEXT DEFAULT 'medium',
        status TEXT DEFAULT 'draft' NOT NULL,
        created_by INTEGER REFERENCES users(id),
        created_at TIMESTAMP DEFAULT now() NOT NULL,
        updated_at TIMESTAMP DEFAULT now() NOT NULL
      )
    `;

        console.log("GameKit migration: game_attempts");
        await sql`
      CREATE TABLE IF NOT EXISTS game_attempts (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        game_id TEXT NOT NULL,
        score INTEGER DEFAULT 0 NOT NULL,
        correct_count INTEGER DEFAULT 0 NOT NULL,
        total_rounds INTEGER DEFAULT 0 NOT NULL,
        breakdown TEXT,
        created_at TIMESTAMP DEFAULT now() NOT NULL
      )
    `;
        await sql`CREATE INDEX IF NOT EXISTS game_attempts_user_game_idx ON game_attempts(user_id, game_id)`;

        console.log("GameKit migration: points_ledger");
        await sql`
      CREATE TABLE IF NOT EXISTS points_ledger (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        source TEXT NOT NULL,
        game_type TEXT NOT NULL,
        points INTEGER DEFAULT 0 NOT NULL,
        created_at TIMESTAMP DEFAULT now() NOT NULL
      )
    `;
        await sql`CREATE INDEX IF NOT EXISTS points_ledger_user_time_idx ON points_ledger(user_id, created_at)`;
        await sql`CREATE INDEX IF NOT EXISTS points_ledger_time_idx ON points_ledger(created_at)`;

        console.log("✅ GameKit migration completed successfully!");
    } catch (error) {
        console.error("❌ GameKit migration failed:", error);
        process.exit(1);
    }
}

migrate();
