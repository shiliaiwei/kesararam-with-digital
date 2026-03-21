import { neon } from "@neondatabase/serverless";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const sql = neon(process.env.DATABASE_URL);

async function checkTopicsTable() {
  try {
    console.log("Checking topics table schema...");
    const columns = await sql`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'topics'
      ORDER BY ordinal_position
    `;
    console.log("Columns:", JSON.stringify(columns, null, 2));

    console.log("\nChecking topics count...");
    const count = await sql`SELECT COUNT(*) as count FROM topics`;
    console.log("Total topics:", count[0].count);

    console.log("\nFetching sample topics...");
    const topics = await sql`SELECT * FROM topics LIMIT 3`;
    console.log("Sample topics:", JSON.stringify(topics, null, 2));
  } catch (error) {
    console.error("Error:", error);
  }
}

checkTopicsTable();
