import { neon } from "@neondatabase/serverless";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const sql = neon(process.env.DATABASE_URL);

async function testQuery() {
  try {
    console.log("Testing the exact query from the API...");
    
    const userId = 229; // The staff user ID from the sample data
    
    // Build WHERE conditions
    const conditions = [];
    conditions.push(`t.created_by = ${userId}`);
    
    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
    
    console.log("Query:", `
      SELECT 
        t.*
      FROM topics t
      ${whereClause}
      ORDER BY t.created_at DESC 
      LIMIT 50 OFFSET 0
    `);
    
    const topics = await sql`
      SELECT 
        t.*
      FROM topics t
      WHERE t.created_by = ${userId}
      ORDER BY t.created_at DESC 
      LIMIT 50 OFFSET 0
    `;
    
    console.log("\n✅ Query successful!");
    console.log("Topics found:", topics.length);
    console.log("\nFirst topic:", JSON.stringify(topics[0], null, 2));
    
    // Test count query
    const countResult = await sql`
      SELECT COUNT(*)::int as total FROM topics t WHERE t.created_by = ${userId}
    `;
    console.log("\nTotal count:", countResult[0].total);
    
  } catch (error) {
    console.error("❌ Error:", error);
  }
}

testQuery();
