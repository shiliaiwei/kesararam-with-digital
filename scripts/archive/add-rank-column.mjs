import { neon } from "@neondatabase/serverless";
import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
const sql = neon(process.env.DATABASE_URL);
await sql`ALTER TABLE game_participants ADD COLUMN IF NOT EXISTS rank integer DEFAULT 0`;
console.log("rank column added to game_participants");
