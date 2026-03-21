import { neon } from "@neondatabase/serverless";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const sql = neon(process.env.DATABASE_URL);

async function addMissingColumns() {
  try {
    console.log("Adding missing columns to topics table...");
    
    // Add submitted_at column
    await sql`
      ALTER TABLE topics 
      ADD COLUMN IF NOT EXISTS submitted_at timestamp
    `;
    console.log("✓ Added submitted_at column");
    
    // Add rejection_reason column
    await sql`
      ALTER TABLE topics 
      ADD COLUMN IF NOT EXISTS rejection_reason text
    `;
    console.log("✓ Added rejection_reason column");
    
    // Add reviewed_at column
    await sql`
      ALTER TABLE topics 
      ADD COLUMN IF NOT EXISTS reviewed_at timestamp
    `;
    console.log("✓ Added reviewed_at column");
    
    console.log("\nVerifying columns...");
    const columns = await sql`
      SELECT column_name, data_type
      FROM information_schema.columns
      WHERE table_name = 'topics'
      AND column_name IN ('submitted_at', 'rejection_reason', 'reviewed_at')
    `;
    console.log("New columns:", columns);
    
    console.log("\n✅ Migration complete!");
  } catch (error) {
    console.error("❌ Error:", error);
  }
}

addMissingColumns();
