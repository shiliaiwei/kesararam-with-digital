import { neon } from "@neondatabase/serverless";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const sql = neon(process.env.DATABASE_URL);

async function checkTopicStatus() {
  try {
    console.log("Checking topic statuses...\n");
    
    const topics = await sql`
      SELECT id, topic_code, name_en, status, created_by, created_at
      FROM topics 
      ORDER BY created_at DESC 
      LIMIT 5
    `;
    
    console.log("Recent topics:");
    topics.forEach(t => {
      console.log(`ID: ${t.id}, Code: ${t.topic_code}, Status: ${t.status}, Name: ${t.name_en.substring(0, 50)}`);
    });
    
    console.log("\n\nStatus counts:");
    const counts = await sql`
      SELECT status, COUNT(*)::int as count
      FROM topics
      GROUP BY status
    `;
    console.log(counts);
    
  } catch (error) {
    console.error("Error:", error);
  }
}

checkTopicStatus();
