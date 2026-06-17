/**
 * Migration: add game_sessions.round_data (JSON text, nullable) so non-MCQ live
 * games — "Click the Sign" (tick-sign) — can store their per-step rounds. MCQ
 * sessions leave it null. Idempotent.
 *
 *   npx tsx scripts/migrate-tick-sign-live.ts
 */

import { neon } from "@neondatabase/serverless";
import { config } from "dotenv";

config({ path: ".env.local" });

const dbUrl = (process.env.DATABASE_URL ?? "").replace(/^['"]+|['"]+$/g, "");
if (!dbUrl) throw new Error("DATABASE_URL is not set");
const sql = neon(dbUrl);

async function main() {
    await sql`ALTER TABLE game_sessions ADD COLUMN IF NOT EXISTS round_data text`;
    const [{ exists }] = await sql`
        SELECT EXISTS (
            SELECT 1 FROM information_schema.columns
            WHERE table_name = 'game_sessions' AND column_name = 'round_data'
        ) AS exists`;
    console.log(`✅ game_sessions.round_data present: ${exists}`);
    process.exit(0);
}

main().catch((e) => {
    console.error("❌ Migration failed:", e);
    process.exit(1);
});
