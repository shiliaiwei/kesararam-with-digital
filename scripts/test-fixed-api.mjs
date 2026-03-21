import { neon } from "@neondatabase/serverless";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const sql = neon(process.env.DATABASE_URL);

async function testFixedAPI() {
  try {
    console.log("Testing fixed API query pattern...\n");
    
    const userId = 229;
    const limit = 50;
    const offset = 0;
    
    // Build WHERE conditions
    const conditions = [];
    conditions.push(`created_by = ${userId}`);
    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
    
    console.log("Testing with sql.unsafe()...");
    const topics = await sql`
      SELECT * FROM topics
      ${sql.unsafe(whereClause)}
      ORDER BY created_at DESC 
      LIMIT ${limit} OFFSET ${offset}
    `;
    
    console.log("✅ Query successful!");
    console.log("Topics found:", topics.length);
    
    // Test count
    const countResult = await sql`
      SELECT COUNT(*)::int as total FROM topics ${sql.unsafe(whereClause)}
    `;
    console.log("Total count:", countResult[0].total);
    
    console.log("\n✅ All tests passed! API should work now.");
    
  } catch (error) {
    console.error("❌ Error:", error);
  }
}

testFixedAPI();
