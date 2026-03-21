import { config } from "dotenv";
import { neon } from "@neondatabase/serverless";

// Load environment variables
config({ path: ".env.local" });

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.error("DATABASE_URL not found in environment");
  process.exit(1);
}

const sql = neon(connectionString);

async function testTopicsInsert() {
  try {
    console.log("Testing topics table...\n");

    // Check if table exists
    const tableCheck = await sql`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'topics'
      );
    `;
    console.log("Topics table exists:", tableCheck[0].exists);

    if (!tableCheck[0].exists) {
      console.error("\n❌ Topics table does not exist!");
      console.log("Run: node scripts/create-complete-system.mjs");
      process.exit(1);
    }

    // Check current topics count
    const countResult = await sql`SELECT COUNT(*)::int as count FROM topics`;
    console.log("Current topics count:", countResult[0].count);

    // Check table structure
    const columns = await sql`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'topics'
      ORDER BY ordinal_position;
    `;
    console.log("\nTable structure:");
    columns.forEach(col => {
      console.log(`  - ${col.column_name}: ${col.data_type} (${col.is_nullable === 'YES' ? 'nullable' : 'not null'})`);
    });

    // Try to insert a test topic
    console.log("\nInserting test topic...");
    const result = await sql`
      INSERT INTO topics (
        topic_code, category_id, name_en, name_km,
        description_en, description_km,
        status, created_by, created_at, updated_at
      ) VALUES (
        ${`TEST-${Date.now()}`}, 
        1, 
        'Test Traffic Sign', 
        'សញ្ញាសាកល្បង',
        'This is a test traffic sign description',
        'នេះគឺជាការពិពណ៌នាសញ្ញាចរាចរណ៍សាកល្បង',
        'draft',
        1,
        NOW(),
        NOW()
      )
      RETURNING *
    `;

    console.log("\n✅ Test topic inserted successfully!");
    console.log("Topic ID:", result[0].id);
    console.log("Topic Code:", result[0].topic_code);
    console.log("Status:", result[0].status);

    // Verify it's in the database
    const verify = await sql`
      SELECT * FROM topics WHERE id = ${result[0].id}
    `;
    console.log("\n✅ Verified in database:", verify.length > 0);

    // Clean up test data
    await sql`DELETE FROM topics WHERE id = ${result[0].id}`;
    console.log("✅ Test data cleaned up");

  } catch (error) {
    console.error("\n❌ Error:", error.message);
    console.error("Full error:", error);
  }
}

testTopicsInsert();
