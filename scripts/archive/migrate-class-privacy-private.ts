import { neon } from "@neondatabase/serverless";
import { config } from "dotenv";

config({ path: ".env.local" });

const dbUrl = (process.env.DATABASE_URL ?? "").replace(/^['"]+|['"]+$/g, "");
if (!dbUrl) throw new Error("DATABASE_URL is not set");

const sql = neon(dbUrl);

async function migrateClassPrivacyPrivate() {
  console.log("Migrating users.is_class_public default to false...");
  await sql`
    ALTER TABLE users
    ALTER COLUMN is_class_public SET DEFAULT false
  `;

  console.log("Updating existing students to is_class_public = false...");
  await sql`
    UPDATE users
    SET is_class_public = false
    WHERE role = 'student'
  `;

  console.log("✅ Class privacy defaults migrated to false successfully.");
}

migrateClassPrivacyPrivate().catch((error) => {
  console.error("❌ Class privacy migration failed:", error);
  process.exit(1);
});
