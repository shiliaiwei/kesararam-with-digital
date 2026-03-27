import { neon } from "@neondatabase/serverless";
import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
const sql = neon(process.env.DATABASE_URL);
const rows = await sql`SELECT id, session_code, status, host_id, question_ids FROM game_sessions ORDER BY created_at DESC LIMIT 5`;
rows.forEach(r => console.log(r.id, r.session_code, r.status, 'host:', r.host_id, 'questions:', r.question_ids?.length));
