import { neon } from "@neondatabase/serverless";
import { config } from "dotenv";

config({ path: ".env.local" });

const dbUrl = (process.env.DATABASE_URL ?? "").replace(/^['"]+|['"]+$/g, "");
if (!dbUrl) throw new Error("DATABASE_URL is not set");

const sql = neon(dbUrl);

async function verifyMigration() {
  try {
    console.log("Verifying migration...");
    
    // Check if columns exist by querying the information schema
    const result = await sql`
      SELECT column_name, data_type, column_default
      FROM information_schema.columns
      WHERE table_name = 'users'
      AND column_name IN ('highest_score', 'total_games_played', 'lifetime_points')
      ORDER BY column_name
    `;
    
    console.log("\n✅ Found columns:");
    result.forEach((col: any) => {
      console.log(`  - ${col.column_name} (${col.data_type}, default: ${col.column_default})`);
    });
    
    if (result.length === 3) {
      console.log("\n✅ All game stats columns exist!");
    } else {
      console.log(`\n⚠️  Expected 3 columns, found ${result.length}`);
    }
    
    // Check indexes
    const indexes = await sql`
      SELECT indexname
      FROM pg_indexes
      WHERE tablename = 'users'
      AND indexname IN ('users_highest_score_idx', 'users_lifetime_points_idx')
      ORDER BY indexname
    `;
    
    console.log("\n✅ Found indexes:");
    indexes.forEach((idx: any) => {
      console.log(`  - ${idx.indexname}`);
    });
    
    if (indexes.length === 2) {
      console.log("\n✅ All indexes exist!");
    } else {
      console.log(`\n⚠️  Expected 2 indexes, found ${indexes.length}`);
    }
    
  } catch (error) {
    console.error("❌ Verification failed:", error);
    process.exit(1);
  }
}

verifyMigration();
