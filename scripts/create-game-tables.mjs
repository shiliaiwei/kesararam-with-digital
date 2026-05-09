import { neon } from "@neondatabase/serverless";
import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

const sql = neon(process.env.DATABASE_URL);

console.log("Creating game tables...");

await sql`
  CREATE TABLE IF NOT EXISTS "game_sessions" (
    "id" serial PRIMARY KEY NOT NULL,
    "session_code" varchar(6) NOT NULL UNIQUE,
    "host_id" integer NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
    "game_mode" varchar(50) NOT NULL,
    "category" varchar(100),
    "difficulty" varchar(20),
    "question_ids" integer[] NOT NULL,
    "current_question_index" integer DEFAULT 0,
    "question_started_at" timestamp,
    "status" varchar(20) NOT NULL DEFAULT 'lobby',
    "scoring_mode" varchar(20) NOT NULL DEFAULT 'speed',
    "time_per_question" integer NOT NULL DEFAULT 30,
    "created_at" timestamp NOT NULL DEFAULT now(),
    "started_at" timestamp,
    "ended_at" timestamp
  )
`;
console.log("✓ game_sessions");

await sql`
  CREATE TABLE IF NOT EXISTS "game_participants" (
    "id" serial PRIMARY KEY NOT NULL,
    "session_id" integer NOT NULL REFERENCES "game_sessions"("id") ON DELETE CASCADE,
    "user_id" integer NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
    "display_name" varchar(100) NOT NULL,
    "avatar" text,
    "total_score" integer NOT NULL DEFAULT 0,
    "correct_answers" integer NOT NULL DEFAULT 0,
    "current_streak" integer NOT NULL DEFAULT 0,
    "is_connected" boolean DEFAULT true,
    "joined_at" timestamp NOT NULL DEFAULT now(),
    "last_seen_at" timestamp NOT NULL DEFAULT now(),
    CONSTRAINT "game_participants_session_user_unique" UNIQUE("session_id", "user_id")
  )
`;
console.log("✓ game_participants");

await sql`
  CREATE TABLE IF NOT EXISTS "game_session_answers" (
    "id" serial PRIMARY KEY NOT NULL,
    "session_id" integer NOT NULL REFERENCES "game_sessions"("id") ON DELETE CASCADE,
    "user_id" integer NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
    "question_id" integer NOT NULL,
    "answer_id" integer,
    "answered_at" timestamp NOT NULL,
    "is_correct" boolean NOT NULL DEFAULT false,
    "speed_score" integer NOT NULL DEFAULT 0,
    "streak_bonus" integer NOT NULL DEFAULT 0,
    "total_points" integer NOT NULL DEFAULT 0,
    "remaining_time_ms" integer NOT NULL DEFAULT 0,
    CONSTRAINT "game_session_answers_session_user_question_unique" UNIQUE("session_id", "user_id", "question_id")
  )
`;
console.log("✓ game_session_answers");

await sql`CREATE INDEX IF NOT EXISTS "game_sessions_session_code_idx" ON "game_sessions"("session_code")`;
await sql`CREATE INDEX IF NOT EXISTS "game_sessions_host_id_idx" ON "game_sessions"("host_id")`;
await sql`CREATE INDEX IF NOT EXISTS "game_participants_session_id_idx" ON "game_participants"("session_id")`;
await sql`CREATE INDEX IF NOT EXISTS "game_session_answers_session_id_idx" ON "game_session_answers"("session_id")`;
console.log("✓ indexes");

console.log("\nAll game tables created successfully!");
