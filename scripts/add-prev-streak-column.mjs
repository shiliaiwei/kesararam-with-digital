import { neon } from "@neondatabase/serverless";
import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
const sql = neon(process.env.DATABASE_URL);
await sql`ALTER TABLE game_session_answers ADD COLUMN IF NOT EXISTS prev_streak integer NOT NULL DEFAULT 0`;
console.log("prev_streak column added to game_session_answers");
