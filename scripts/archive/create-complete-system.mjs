import { neon } from "@neondatabase/serverless";
import { config } from "dotenv";

config({ path: ".env.local" });

const sql = neon(process.env.DATABASE_URL);

async function createCompleteSystem() {
  console.log("Creating complete KWD system tables...");

  try {
    // 1. Update categories table with proper names
    console.log("Updating categories...");
    await sql`
      INSERT INTO categories (id, slug, title_en, title_km, sort_order, is_active)
      VALUES 
        (1, 'road-sign', 'Traffic Signs', 'សញ្ញាចរាចរណ៍', 1, true),
        (2, 'road-traffic', 'Road Traffic Law', 'ច្បាប់ចរាចរណ៍ផ្លូវ', 2, true),
        (3, 'priority', 'Right of Way', 'សិទ្ធិអាទិភាព', 3, true),
        (4, 'driving', 'Driving Skills', 'ជំនាញបើកបរ', 4, true),
        (5, 'technical', 'Vehicle Technology', 'បច្ចេកវិទ្យាយានយន្ត', 5, true),
        (6, 'loading-people-goods', 'Loading People & Goods', 'ផ្ទុកមនុស្ស និងទំនិញ', 6, true),
        (7, 'general-knowledge', 'General Knowledge', 'ចំណេះដឹងទូទៅ', 7, true),
        (8, 'emergency', 'Emergency', 'ពេលអាសន្ន', 8, true)
      ON CONFLICT (id) DO UPDATE SET
        title_en = EXCLUDED.title_en,
        title_km = EXCLUDED.title_km,
        sort_order = EXCLUDED.sort_order;
    `;
    console.log("✓ Categories updated");

    // 2. Create topics table (replaces old content_items for topic-level data)
    console.log("Creating topics table...");
    await sql`
      CREATE TABLE IF NOT EXISTS topics (
        id SERIAL PRIMARY KEY,
        topic_code TEXT UNIQUE NOT NULL,
        category_id INTEGER NOT NULL REFERENCES categories(id),
        name_en TEXT NOT NULL,
        name_km TEXT NOT NULL,
        description_en TEXT NOT NULL DEFAULT '',
        description_km TEXT NOT NULL DEFAULT '',
        primary_image_url TEXT,
        primary_image_source TEXT DEFAULT 'url',
        law_reference TEXT,
        sub_group TEXT,
        audio_url_en TEXT,
        audio_source_en TEXT DEFAULT 'url',
        audio_url_km TEXT,
        audio_source_km TEXT DEFAULT 'url',
        status TEXT NOT NULL DEFAULT 'draft',
        created_by INTEGER REFERENCES users(id),
        approved_by INTEGER REFERENCES users(id),
        approved_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT NOW() NOT NULL,
        updated_at TIMESTAMP DEFAULT NOW() NOT NULL
      );
    `;
    await sql`CREATE INDEX IF NOT EXISTS idx_topics_category ON topics(category_id);`;
    await sql`CREATE INDEX IF NOT EXISTS idx_topics_status ON topics(status);`;
    await sql`CREATE INDEX IF NOT EXISTS idx_topics_created_by ON topics(created_by);`;
    console.log("✓ Created topics table");

    // 3. Update questions table to link to topics
    console.log("Updating questions table...");
    await sql`
      ALTER TABLE questions 
      DROP COLUMN IF EXISTS content_id,
      ADD COLUMN IF NOT EXISTS topic_id INTEGER REFERENCES topics(id) ON DELETE CASCADE,
      ADD COLUMN IF NOT EXISTS difficulty TEXT DEFAULT 'medium',
      ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'draft';
    `;
    await sql`CREATE INDEX IF NOT EXISTS idx_questions_topic ON questions(topic_id);`;
    console.log("✓ Updated questions table");

    // 4. Create game_modes table
    console.log("Creating game_modes table...");
    await sql`
      CREATE TABLE IF NOT EXISTS game_modes (
        id SERIAL PRIMARY KEY,
        mode_key TEXT UNIQUE NOT NULL,
        name_en TEXT NOT NULL,
        name_km TEXT NOT NULL,
        description_en TEXT,
        description_km TEXT,
        tag_label TEXT,
        question_count INTEGER DEFAULT 10,
        time_limit INTEGER,
        timer_per_question BOOLEAN DEFAULT false,
        categories_included TEXT[],
        difficulty_levels TEXT[],
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT NOW() NOT NULL,
        updated_at TIMESTAMP DEFAULT NOW() NOT NULL
      );
    `;
    
    await sql`
      INSERT INTO game_modes (mode_key, name_en, name_km, tag_label, question_count, time_limit, timer_per_question)
      VALUES 
        ('quick-quiz', 'Quick Quiz', 'តេស្តរហ័ស', '10 QUESTIONS', 10, NULL, false),
        ('speed-round', 'Speed Round', 'ជុំលឿន', '60 SECONDS', 999, 60, false),
        ('sign-challenge', 'Sign Challenge', 'បញ្ហាប្រឈមសញ្ញា', 'VISUAL', 20, NULL, false),
        ('mixed-battle', 'Mixed Battle', 'ការប្រយុទ្ធចម្រុះ', 'ALL CATEGORIES', 30, NULL, true),
        ('daily-challenge', 'Daily Challenge', 'បញ្ហាប្រឈមប្រចាំថ្ងៃ', 'DAILY', 15, NULL, true),
        ('exam-simulation', 'Exam Simulation', 'ការធ្វើតេស្តពិត', '40 QUESTIONS', 40, 2400, false)
      ON CONFLICT (mode_key) DO UPDATE SET
        name_en = EXCLUDED.name_en,
        name_km = EXCLUDED.name_km;
    `;
    console.log("✓ Created game_modes table");

    // 5. Create learning_mode_settings table
    console.log("Creating learning_mode_settings table...");
    await sql`
      CREATE TABLE IF NOT EXISTS learning_mode_settings (
        id SERIAL PRIMARY KEY,
        topic_id INTEGER REFERENCES topics(id) ON DELETE CASCADE,
        category_id INTEGER REFERENCES categories(id),
        mode_type TEXT NOT NULL,
        settings JSONB NOT NULL DEFAULT '{}',
        created_at TIMESTAMP DEFAULT NOW() NOT NULL,
        updated_at TIMESTAMP DEFAULT NOW() NOT NULL,
        UNIQUE(topic_id, mode_type)
      );
    `;
    console.log("✓ Created learning_mode_settings table");

    // 6. Create challenge_sessions table (for teacher-led live challenges)
    console.log("Creating challenge_sessions table...");
    await sql`DROP TABLE IF EXISTS challenge_sessions CASCADE;`;
    await sql`
      CREATE TABLE challenge_sessions (
        id SERIAL PRIMARY KEY,
        session_code TEXT UNIQUE NOT NULL,
        teacher_id INTEGER NOT NULL REFERENCES users(id),
        session_name TEXT NOT NULL,
        category_ids INTEGER[],
        difficulty_levels TEXT[],
        question_count INTEGER NOT NULL,
        time_per_question INTEGER NOT NULL,
        scoring_mode TEXT DEFAULT 'speed',
        allow_late_join BOOLEAN DEFAULT true,
        language TEXT DEFAULT 'both',
        status TEXT DEFAULT 'lobby',
        started_at TIMESTAMP,
        ended_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT NOW() NOT NULL
      );
    `;
    await sql`CREATE INDEX idx_challenge_sessions_teacher ON challenge_sessions(teacher_id);`;
    await sql`CREATE INDEX idx_challenge_sessions_code ON challenge_sessions(session_code);`;
    console.log("✓ Created challenge_sessions table");

    // 7. Create challenge_participants table
    console.log("Creating challenge_participants table...");
    await sql`
      CREATE TABLE IF NOT EXISTS challenge_participants (
        id SERIAL PRIMARY KEY,
        session_id INTEGER NOT NULL REFERENCES challenge_sessions(id) ON DELETE CASCADE,
        user_id INTEGER REFERENCES users(id),
        display_name TEXT NOT NULL,
        score INTEGER DEFAULT 0,
        correct_answers INTEGER DEFAULT 0,
        joined_at TIMESTAMP DEFAULT NOW() NOT NULL
      );
    `;
    await sql`CREATE INDEX IF NOT EXISTS idx_challenge_participants_session ON challenge_participants(session_id);`;
    console.log("✓ Created challenge_participants table");

    // 8. Create daily_challenge_sets table
    console.log("Creating daily_challenge_sets table...");
    await sql`
      CREATE TABLE IF NOT EXISTS daily_challenge_sets (
        id SERIAL PRIMARY KEY,
        challenge_date DATE UNIQUE NOT NULL,
        question_ids INTEGER[] NOT NULL,
        created_at TIMESTAMP DEFAULT NOW() NOT NULL
      );
    `;
    console.log("✓ Created daily_challenge_sets table");

    // 9. Create user_streaks table
    console.log("Creating user_streaks table...");
    await sql`
      CREATE TABLE IF NOT EXISTS user_streaks (
        id SERIAL PRIMARY KEY,
        user_id INTEGER UNIQUE NOT NULL REFERENCES users(id),
        current_streak INTEGER DEFAULT 0,
        longest_streak INTEGER DEFAULT 0,
        last_play_date DATE,
        created_at TIMESTAMP DEFAULT NOW() NOT NULL,
        updated_at TIMESTAMP DEFAULT NOW() NOT NULL
      );
    `;
    console.log("✓ Created user_streaks table");

    // 10. Create game_scores table
    console.log("Creating game_scores table...");
    await sql`
      CREATE TABLE IF NOT EXISTS game_scores (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id),
        game_mode TEXT NOT NULL,
        score INTEGER NOT NULL,
        total_questions INTEGER NOT NULL,
        correct_answers INTEGER NOT NULL,
        time_taken INTEGER,
        difficulty TEXT,
        category_breakdown JSONB,
        created_at TIMESTAMP DEFAULT NOW() NOT NULL
      );
    `;
    await sql`CREATE INDEX IF NOT EXISTS idx_game_scores_user ON game_scores(user_id);`;
    await sql`CREATE INDEX IF NOT EXISTS idx_game_scores_mode ON game_scores(game_mode);`;
    await sql`CREATE INDEX IF NOT EXISTS idx_game_scores_created ON game_scores(created_at);`;
    console.log("✓ Created game_scores table");

    // 11. Create staff_category_assignments table
    console.log("Creating staff_category_assignments table...");
    await sql`
      CREATE TABLE IF NOT EXISTS staff_category_assignments (
        id SERIAL PRIMARY KEY,
        staff_id INTEGER NOT NULL REFERENCES users(id),
        category_id INTEGER NOT NULL REFERENCES categories(id),
        assigned_by INTEGER REFERENCES users(id),
        assigned_at TIMESTAMP DEFAULT NOW() NOT NULL,
        UNIQUE(staff_id, category_id)
      );
    `;
    await sql`CREATE INDEX IF NOT EXISTS idx_staff_assignments_staff ON staff_category_assignments(staff_id);`;
    console.log("✓ Created staff_category_assignments table");

    console.log("\n✅ Complete KWD system created successfully!");
    console.log("\nTables created:");
    console.log("  1. categories (updated)");
    console.log("  2. topics (new - replaces content_items for topics)");
    console.log("  3. questions (updated - links to topics)");
    console.log("  4. answers (existing)");
    console.log("  5. game_modes");
    console.log("  6. learning_mode_settings");
    console.log("  7. challenge_sessions");
    console.log("  8. challenge_participants");
    console.log("  9. daily_challenge_sets");
    console.log("  10. user_streaks");
    console.log("  11. game_scores");
    console.log("  12. staff_category_assignments");

  } catch (error) {
    console.error("❌ Error creating system:", error);
    throw error;
  }
}

createCompleteSystem();
