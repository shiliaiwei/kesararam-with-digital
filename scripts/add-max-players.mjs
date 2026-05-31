import { neon } from "@neondatabase/serverless";
import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
const sql = neon(process.env.DATABASE_URL);
await sql`ALTER TABLE game_sessions ADD COLUMN IF NOT EXISTS max_players integer NOT NULL DEFAULT 50`;
console.log("max_players column added");
