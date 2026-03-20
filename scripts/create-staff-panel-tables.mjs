import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { config } from "dotenv";

config({ path: ".env.local" });

const sql = postgres(process.env.DATABASE_URL);
const db = drizzle(sql);

async function createStaffPanelTables() {
  console.log("Creating staff panel tables...");

  try {
    // 1. Enhance content_items table
    console.log("Enhancing content_items table...");
    await sql`
      ALTER TABLE content_items 
      ADD COLUMN IF NOT EXISTS video_url TEXT,
      ADD COLUMN IF NOT EXISTS logo_url TEXT,
      ADD COLUMN IF NOT EXISTS brand_url TEXT,
      ADD COLUMN IF NOT EXISTS resource_type TEXT DEFAULT 'qa',
      ADD COLUMN IF NOT EXISTS tags TEXT[],
      ADD COLUMN IF NOT EXISTS metadata JSONB;
    `;
    console.log("✓ Enhanced content_items table");

    // 2. Create media_resources table
    console.log("Creating media_resources table...");
    await sql`
      CREATE TABLE IF NOT EXISTS media_resources (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        type TEXT NOT NULL,
        url TEXT NOT NULL,
        source TEXT NOT NULL DEFAULT 'cloudinary',
        cloudinary_id TEXT,
        file_size INTEGER,
        mime_type TEXT,
        width INTEGER,
        height INTEGER,
        duration INTEGER,
        created_by INTEGER REFERENCES users(id),
        created_at TIMESTAMP DEFAULT NOW() NOT NULL,
        updated_at TIMESTAMP DEFAULT NOW() NOT NULL
      );
    `;
    await sql`CREATE INDEX IF NOT EXISTS idx_media_resources_type ON media_resources(type);`;
    await sql`CREATE INDEX IF NOT EXISTS idx_media_resources_created_by ON media_resources(created_by);`;
    console.log("✓ Created media_resources table");

    // 3. Create content_media relationship table
    console.log("Creating content_media table...");
    await sql`
      CREATE TABLE IF NOT EXISTS content_media (
        id SERIAL PRIMARY KEY,
        content_id INTEGER NOT NULL REFERENCES content_items(id) ON DELETE CASCADE,
        media_id INTEGER NOT NULL REFERENCES media_resources(id) ON DELETE CASCADE,
        usage_type TEXT NOT NULL,
        sort_order INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT NOW() NOT NULL,
        UNIQUE(content_id, media_id, usage_type)
      );
    `;
    await sql`CREATE INDEX IF NOT EXISTS idx_content_media_content_id ON content_media(content_id);`;
    await sql`CREATE INDEX IF NOT EXISTS idx_content_media_media_id ON content_media(media_id);`;
    console.log("✓ Created content_media table");

    // 4. Create game_mode_content table
    console.log("Creating game_mode_content table...");
    await sql`
      CREATE TABLE IF NOT EXISTS game_mode_content (
        id SERIAL PRIMARY KEY,
        content_id INTEGER NOT NULL REFERENCES content_items(id) ON DELETE CASCADE,
        game_mode TEXT NOT NULL,
        is_active BOOLEAN DEFAULT true NOT NULL,
        difficulty_override TEXT,
        points_override INTEGER,
        time_limit_override INTEGER,
        created_at TIMESTAMP DEFAULT NOW() NOT NULL,
        UNIQUE(content_id, game_mode)
      );
    `;
    await sql`CREATE INDEX IF NOT EXISTS idx_game_mode_content_content_id ON game_mode_content(content_id);`;
    await sql`CREATE INDEX IF NOT EXISTS idx_game_mode_content_game_mode ON game_mode_content(game_mode);`;
    console.log("✓ Created game_mode_content table");

    // 5. Create staff_activity_metrics table
    console.log("Creating staff_activity_metrics table...");
    await sql`
      CREATE TABLE IF NOT EXISTS staff_activity_metrics (
        id SERIAL PRIMARY KEY,
        staff_id INTEGER NOT NULL REFERENCES users(id),
        action_type TEXT NOT NULL,
        content_id INTEGER REFERENCES content_items(id),
        category_id INTEGER,
        metadata JSONB,
        created_at TIMESTAMP DEFAULT NOW() NOT NULL
      );
    `;
    await sql`CREATE INDEX IF NOT EXISTS idx_staff_activity_staff_id ON staff_activity_metrics(staff_id);`;
    await sql`CREATE INDEX IF NOT EXISTS idx_staff_activity_created_at ON staff_activity_metrics(created_at);`;
    console.log("✓ Created staff_activity_metrics table");

    // 6. Create admin_review_metrics table
    console.log("Creating admin_review_metrics table...");
    await sql`
      CREATE TABLE IF NOT EXISTS admin_review_metrics (
        id SERIAL PRIMARY KEY,
        admin_id INTEGER NOT NULL REFERENCES users(id),
        content_id INTEGER NOT NULL REFERENCES content_items(id),
        action TEXT NOT NULL,
        review_time INTEGER,
        comments TEXT,
        created_at TIMESTAMP DEFAULT NOW() NOT NULL
      );
    `;
    await sql`CREATE INDEX IF NOT EXISTS idx_admin_review_admin_id ON admin_review_metrics(admin_id);`;
    await sql`CREATE INDEX IF NOT EXISTS idx_admin_review_created_at ON admin_review_metrics(created_at);`;
    console.log("✓ Created admin_review_metrics table");

    console.log("\n✅ All staff panel tables created successfully!");
    console.log("\nTables created:");
    console.log("  1. content_items (enhanced)");
    console.log("  2. media_resources");
    console.log("  3. content_media");
    console.log("  4. game_mode_content");
    console.log("  5. staff_activity_metrics");
    console.log("  6. admin_review_metrics");

  } catch (error) {
    console.error("❌ Error creating tables:", error);
    throw error;
  } finally {
    await sql.end();
  }
}

createStaffPanelTables();
