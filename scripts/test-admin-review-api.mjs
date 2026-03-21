import { neon } from "@neondatabase/serverless";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const sql = neon(process.env.DATABASE_URL);

async function testAdminReviewAPI() {
  try {
    console.log("Testing admin review API query...\n");
    
    const status = 'pending';
    const conditions = [`t.status = '${status}'`];
    const whereClause = `WHERE ${conditions.join(' AND ')}`;
    
    console.log("Query:", `
      SELECT 
        t.*,
        c.title_en as category_name,
        u.name as creator_name,
        (SELECT COUNT(*)::int FROM questions WHERE topic_id = t.id) as question_count
      FROM topics t
      LEFT JOIN categories c ON t.category_id = c.id
      LEFT JOIN users u ON t.created_by = u.id
      ${whereClause}
      ORDER BY t.created_at DESC
    `);
    
    const result = await sql`
      SELECT 
        t.*,
        c.title_en as category_name,
        u.display_name as creator_name,
        (SELECT COUNT(*)::int FROM questions WHERE topic_id = t.id) as question_count
      FROM topics t
      LEFT JOIN categories c ON t.category_id = c.id
      LEFT JOIN users u ON t.created_by = u.id
      WHERE t.status = 'pending'
      ORDER BY t.created_at DESC
    `;
    
    console.log("\n✅ Query successful!");
    console.log("Topics found:", result.length);
    console.log("\nFirst topic:");
    console.log({
      id: result[0]?.id,
      topic_code: result[0]?.topic_code,
      name_en: result[0]?.name_en?.substring(0, 50),
      status: result[0]?.status,
      category_name: result[0]?.category_name,
      creator_name: result[0]?.creator_name,
      question_count: result[0]?.question_count
    });
    
    // Test stats query
    const statsResult = await sql`
      SELECT 
        COUNT(*) FILTER (WHERE status = 'pending')::int as pending,
        COUNT(*) FILTER (WHERE status = 'approved' AND DATE(approved_at) = CURRENT_DATE)::int as approved,
        COUNT(*) FILTER (WHERE status = 'rejected' AND DATE(updated_at) = CURRENT_DATE)::int as rejected
      FROM topics
    `;
    
    console.log("\nStats:", statsResult[0]);
    
  } catch (error) {
    console.error("❌ Error:", error);
  }
}

testAdminReviewAPI();
