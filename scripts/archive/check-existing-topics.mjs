import { config } from "dotenv";
import { neon } from "@neondatabase/serverless";

config({ path: ".env.local" });
const sql = neon(process.env.DATABASE_URL);

async function checkTopics() {
  try {
    const topics = await sql`
      SELECT *
      FROM topics
      ORDER BY created_at DESC
    `;

    console.log(`\nFound ${topics.length} topics:\n`);
    
    topics.forEach((topic, index) => {
      console.log(`${index + 1}. ${topic.name_en} (${topic.name_km})`);
      console.log(`   ID: ${topic.id}`);
      console.log(`   Code: ${topic.topic_code}`);
      console.log(`   Category ID: ${topic.category_id}`);
      console.log(`   Status: ${topic.status}`);
      console.log(`   Created by user ID: ${topic.created_by}`);
      console.log(`   Created at: ${topic.created_at}`);
      console.log(`   Sub-group: ${topic.sub_group || 'None'}`);
      console.log('');
    });

  } catch (error) {
    console.error("Error:", error.message);
  }
}

checkTopics();
