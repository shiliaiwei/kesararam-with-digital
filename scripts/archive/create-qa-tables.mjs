import { neon } from "@neondatabase/serverless";
import { config } from "dotenv";

config({ path: ".env.local" });

const sql = neon(process.env.DATABASE_URL);

async function createQATables() {
  console.log("Creating Q&A tables...");

  try {
    // 1. Add new columns to content_items
    console.log("Enhancing content_items table...");
    await sql`
      ALTER TABLE content_items 
      ADD COLUMN IF NOT EXISTS image_source TEXT DEFAULT 'url',
      ADD COLUMN IF NOT EXISTS audio_source_en TEXT DEFAULT 'url',
      ADD COLUMN IF NOT EXISTS audio_source_km TEXT DEFAULT 'url',
      ADD COLUMN IF NOT EXISTS hint_en TEXT,
      ADD COLUMN IF NOT EXISTS hint_km TEXT;
    `;
    console.log("✓ Enhanced content_items table");

    // 2. Create questions table
    console.log("Creating questions table...");
    await sql`
      CREATE TABLE IF NOT EXISTS questions (
        id SERIAL PRIMARY KEY,
        content_id INTEGER NOT NULL REFERENCES content_items(id) ON DELETE CASCADE,
        question_en TEXT NOT NULL,
        question_km TEXT NOT NULL DEFAULT '',
        hint_en TEXT,
        hint_km TEXT,
        image_url TEXT,
        image_source TEXT DEFAULT 'url',
        audio_url_en TEXT,
        audio_source_en TEXT DEFAULT 'url',
        audio_url_km TEXT,
        audio_source_km TEXT DEFAULT 'url',
        sort_order INTEGER DEFAULT 0 NOT NULL,
        created_at TIMESTAMP DEFAULT NOW() NOT NULL
      );
    `;
    await sql`CREATE INDEX IF NOT EXISTS idx_questions_content_id ON questions(content_id);`;
    console.log("✓ Created questions table");

    // 3. Create answers table
    console.log("Creating answers table...");
    await sql`
      CREATE TABLE IF NOT EXISTS answers (
        id SERIAL PRIMARY KEY,
        question_id INTEGER NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
        answer_type TEXT NOT NULL,
        answer_en TEXT NOT NULL,
        answer_km TEXT NOT NULL DEFAULT '',
        is_correct BOOLEAN DEFAULT false NOT NULL,
        image_url TEXT,
        image_source TEXT DEFAULT 'url',
        sort_order INTEGER DEFAULT 0 NOT NULL,
        metadata TEXT,
        created_at TIMESTAMP DEFAULT NOW() NOT NULL
      );
    `;
    await sql`CREATE INDEX IF NOT EXISTS idx_answers_question_id ON answers(question_id);`;
    console.log("✓ Created answers table");

    console.log("\n✅ All Q&A tables created successfully!");
    console.log("\nTables created:");
    console.log("  1. content_items (enhanced)");
    console.log("  2. questions");
    console.log("  3. answers");

  } catch (error) {
    console.error("❌ Error creating tables:", error);
    throw error;
  }
}

createQATables();
