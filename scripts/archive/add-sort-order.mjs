import { neon } from "@neondatabase/serverless";
import { config } from "dotenv";

config({ path: ".env.local" });

const sql = neon(process.env.DATABASE_URL);

async function addSortOrder() {
  console.log("Adding sort_order column to topics...");

  try {
    await sql`
      ALTER TABLE topics 
      ADD COLUMN IF NOT EXISTS sort_order INTEGER DEFAULT 0;
    `;
    
    console.log("✓ Added sort_order column");
  } catch (error) {
    console.error("❌ Error:", error);
    throw error;
  }
}

addSortOrder();
