import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { config } from "dotenv";

config({ path: ".env.local" });

const sql = postgres(process.env.DATABASE_URL);
const db = drizzle(sql);

async function createTrafficSignsTables() {
  console.log("Creating traffic signs tables...");

  try {
    // Create traffic_signs table
    await sql`
      CREATE TABLE IF NOT EXISTS traffic_signs (
        id SERIAL PRIMARY KEY,
        title_en TEXT NOT NULL,
        title_km TEXT NOT NULL,
        description_en TEXT NOT NULL,
        description_km TEXT NOT NULL,
        image_url TEXT NOT NULL,
        audio_url_en TEXT,
        audio_url_km TEXT,
        sign_type TEXT NOT NULL,
        category TEXT,
        status TEXT NOT NULL DEFAULT 'pending',
        created_by INTEGER REFERENCES users(id),
        approved_by INTEGER REFERENCES users(id),
        approved_at TIMESTAMP,
        rejection_reason TEXT,
        is_active BOOLEAN DEFAULT false NOT NULL,
        sort_order INTEGER DEFAULT 0 NOT NULL,
        created_at TIMESTAMP DEFAULT NOW() NOT NULL,
        updated_at TIMESTAMP DEFAULT NOW() NOT NULL
      );
    `;
    console.log("✓ Created traffic_signs table");

    // Create traffic_sign_approvals table
    await sql`
      CREATE TABLE IF NOT EXISTS traffic_sign_approvals (
        id SERIAL PRIMARY KEY,
        sign_id INTEGER NOT NULL REFERENCES traffic_signs(id) ON DELETE CASCADE,
        admin_id INTEGER NOT NULL REFERENCES users(id),
        action TEXT NOT NULL,
        comments TEXT,
        created_at TIMESTAMP DEFAULT NOW() NOT NULL
      );
    `;
    console.log("✓ Created traffic_sign_approvals table");

    // Create indexes
    await sql`CREATE INDEX IF NOT EXISTS idx_traffic_signs_status ON traffic_signs(status);`;
    await sql`CREATE INDEX IF NOT EXISTS idx_traffic_signs_created_by ON traffic_signs(created_by);`;
    await sql`CREATE INDEX IF NOT EXISTS idx_traffic_signs_sign_type ON traffic_signs(sign_type);`;
    console.log("✓ Created indexes");

    console.log("\n✅ Traffic signs tables created successfully!");
  } catch (error) {
    console.error("❌ Error creating tables:", error);
    throw error;
  } finally {
    await sql.end();
  }
}

createTrafficSignsTables();
