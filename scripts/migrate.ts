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

    console.log("Running migration: add_target_group_to_sessions");
    await sql`
      ALTER TABLE game_sessions 
      ADD COLUMN IF NOT EXISTS target_group VARCHAR(50) DEFAULT 'university' NOT NULL
    `;

    console.log("Running migration: add_school_and_class_fields");
    await sql`
      ALTER TABLE users 
      ADD COLUMN IF NOT EXISTS school_name TEXT,
      ADD COLUMN IF NOT EXISTS province TEXT,
      ADD COLUMN IF NOT EXISTS grade_level TEXT,
      ADD COLUMN IF NOT EXISTS section TEXT,
      ADD COLUMN IF NOT EXISTS parent_contact TEXT,
      ADD COLUMN IF NOT EXISTS claimed_rewards TEXT DEFAULT '[]' NOT NULL
    `;
    await sql`
      ALTER TABLE classes 
      ADD COLUMN IF NOT EXISTS grade_level TEXT,
      ADD COLUMN IF NOT EXISTS school_name TEXT,
      ADD COLUMN IF NOT EXISTS province TEXT,
      ADD COLUMN IF NOT EXISTS section TEXT,
      ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active' NOT NULL
    `;

    console.log("Running migration: add_google_id_and_invite_codes");
    await sql`
      ALTER TABLE users 
      ADD COLUMN IF NOT EXISTS google_id TEXT UNIQUE,
      ADD COLUMN IF NOT EXISTS is_profile_public BOOLEAN DEFAULT true NOT NULL
    `;
    await sql`
      CREATE TABLE IF NOT EXISTS invite_codes (
        id SERIAL PRIMARY KEY,
        code TEXT NOT NULL UNIQUE,
        teacher_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        is_used BOOLEAN DEFAULT false NOT NULL,
        used_by_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
        used_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT now() NOT NULL
      )
    `;

    console.log("Running migration: add_username_changed_at");
    await sql`
      ALTER TABLE users 
      ADD COLUMN IF NOT EXISTS username_changed_at TIMESTAMP
    `;

    console.log("Running migration: add_profile_edit_unlocked_until");
    await sql`
      ALTER TABLE users
      ADD COLUMN IF NOT EXISTS profile_edit_unlocked_until TIMESTAMP
    `;

    console.log("Running migration: add_class_id_to_invite_codes");
    await sql`
      ALTER TABLE invite_codes 
      ADD COLUMN IF NOT EXISTS class_id INTEGER REFERENCES classes(id) ON DELETE CASCADE
    `;

    console.log("Running migration: add_individual_privacy_columns");
    await sql`
      ALTER TABLE users 
      ADD COLUMN IF NOT EXISTS is_name_public BOOLEAN DEFAULT true NOT NULL,
      ADD COLUMN IF NOT EXISTS is_username_public BOOLEAN DEFAULT true NOT NULL,
      ADD COLUMN IF NOT EXISTS is_school_public BOOLEAN DEFAULT true NOT NULL,
      ADD COLUMN IF NOT EXISTS is_province_public BOOLEAN DEFAULT true NOT NULL,
      ADD COLUMN IF NOT EXISTS is_class_public BOOLEAN DEFAULT true NOT NULL,
      ADD COLUMN IF NOT EXISTS is_grade_public BOOLEAN DEFAULT true NOT NULL,
      ADD COLUMN IF NOT EXISTS is_section_public BOOLEAN DEFAULT true NOT NULL,
      ADD COLUMN IF NOT EXISTS is_stats_public BOOLEAN DEFAULT true NOT NULL
    `;

    console.log("Running migration: make_student_profiles_public_by_default");
    await sql`
      ALTER TABLE users 
      ALTER COLUMN is_profile_public SET DEFAULT true,
      ALTER COLUMN is_name_public SET DEFAULT true,
      ALTER COLUMN is_username_public SET DEFAULT true,
      ALTER COLUMN is_school_public SET DEFAULT false,
      ALTER COLUMN is_province_public SET DEFAULT true,
      ALTER COLUMN is_class_public SET DEFAULT false,
      ALTER COLUMN is_grade_public SET DEFAULT true,
      ALTER COLUMN is_section_public SET DEFAULT true,
      ALTER COLUMN is_stats_public SET DEFAULT true
    `;
    await sql`
      UPDATE users
      SET is_profile_public = true,
          is_name_public = true,
          is_username_public = true,
          is_school_public = false,
          is_province_public = true,
          is_class_public = false,
          is_grade_public = true,
          is_section_public = true,
          is_stats_public = true
      WHERE role = 'student'
    `;

    console.log("Running migration: add_class_scope_to_game_sessions");
    await sql`
      ALTER TABLE game_sessions
      ADD COLUMN IF NOT EXISTS class_id INTEGER REFERENCES classes(id) ON DELETE SET NULL
    `;

    console.log("Running migration: add_name_changed_count_to_classes");
    await sql`
      ALTER TABLE classes
      ADD COLUMN IF NOT EXISTS name_changed_count INTEGER DEFAULT 0 NOT NULL
    `;

    console.log("Running migration: update_class_enrollments_foreign_keys_on_delete");
    // Update studentId foreign key to ON DELETE CASCADE
    await sql`
      ALTER TABLE class_enrollments 
      DROP CONSTRAINT IF EXISTS class_enrollments_student_id_users_id_fk
    `;
    await sql`
      ALTER TABLE class_enrollments 
      ADD CONSTRAINT class_enrollments_student_id_users_id_fk 
      FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE
    `;

    // Update classId foreign key to ON DELETE CASCADE
    await sql`
      ALTER TABLE class_enrollments 
      DROP CONSTRAINT IF EXISTS class_enrollments_class_id_classes_id_fk
    `;
    await sql`
      ALTER TABLE class_enrollments 
      ADD CONSTRAINT class_enrollments_class_id_classes_id_fk 
      FOREIGN KEY (class_id) REFERENCES classes(id) ON DELETE CASCADE
    `;

    // Update enrolledBy foreign key to ON DELETE SET NULL
    await sql`
      ALTER TABLE class_enrollments 
      DROP CONSTRAINT IF EXISTS class_enrollments_enrolled_by_users_id_fk
    `;
    await sql`
      ALTER TABLE class_enrollments 
      ADD CONSTRAINT class_enrollments_enrolled_by_users_id_fk 
      FOREIGN KEY (enrolled_by) REFERENCES users(id) ON DELETE SET NULL
    `;

    console.log("Running migration: update_remaining_users_foreign_keys_on_delete");
    // quizzes table
    await sql`ALTER TABLE quizzes DROP CONSTRAINT IF EXISTS quizzes_created_by_users_id_fk`;
    await sql`ALTER TABLE quizzes ADD CONSTRAINT quizzes_created_by_users_id_fk FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL`;

    // quiz_attempts table
    await sql`ALTER TABLE quiz_attempts DROP CONSTRAINT IF EXISTS quiz_attempts_user_id_users_id_fk`;
    await sql`ALTER TABLE quiz_attempts ADD CONSTRAINT quiz_attempts_user_id_users_id_fk FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE`;

    // challenge_sessions table
    await sql`ALTER TABLE challenge_sessions DROP CONSTRAINT IF EXISTS challenge_sessions_teacher_id_users_id_fk`;
    await sql`ALTER TABLE challenge_sessions ADD CONSTRAINT challenge_sessions_teacher_id_users_id_fk FOREIGN KEY (teacher_id) REFERENCES users(id) ON DELETE CASCADE`;

    // session_participants table
    await sql`ALTER TABLE session_participants DROP CONSTRAINT IF EXISTS session_participants_student_id_users_id_fk`;
    await sql`ALTER TABLE session_participants ADD CONSTRAINT session_participants_student_id_users_id_fk FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE`;

    // session_answers table
    await sql`ALTER TABLE session_answers DROP CONSTRAINT IF EXISTS session_answers_student_id_users_id_fk`;
    await sql`ALTER TABLE session_answers ADD CONSTRAINT session_answers_student_id_users_id_fk FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE`;

    // leaderboard_entries table
    await sql`ALTER TABLE leaderboard_entries DROP CONSTRAINT IF EXISTS leaderboard_entries_student_id_users_id_fk`;
    await sql`ALTER TABLE leaderboard_entries ADD CONSTRAINT leaderboard_entries_student_id_users_id_fk FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE`;

    // sessions table
    await sql`
      CREATE TABLE IF NOT EXISTS sessions (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL,
        token TEXT NOT NULL UNIQUE,
        ip_address TEXT,
        user_agent TEXT,
        is_active BOOLEAN DEFAULT true NOT NULL,
        login_at TIMESTAMP DEFAULT now() NOT NULL,
        last_activity_at TIMESTAMP DEFAULT now() NOT NULL,
        logout_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT now() NOT NULL
      )
    `;
    await sql`ALTER TABLE sessions DROP CONSTRAINT IF EXISTS sessions_user_id_fkey`;
    await sql`ALTER TABLE sessions DROP CONSTRAINT IF EXISTS sessions_user_id_users_id_fk`;
    await sql`ALTER TABLE sessions ADD CONSTRAINT sessions_user_id_users_id_fk FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE`;

    // audit_logs table
    await sql`ALTER TABLE audit_logs DROP CONSTRAINT IF EXISTS audit_logs_user_id_users_id_fk`;
    await sql`ALTER TABLE audit_logs ADD CONSTRAINT audit_logs_user_id_users_id_fk FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL`;

    console.log("✅ Migration completed successfully!");
  } catch (error) {
    console.error("❌ Migration failed:", error);
    process.exit(1);
  }
}

migrate();
