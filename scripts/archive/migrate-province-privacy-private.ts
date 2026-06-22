import { neon } from "@neondatabase/serverless";
import { config } from "dotenv";

config({ path: ".env.local" });

const dbUrl = (process.env.DATABASE_URL ?? "").replace(/^['"]+|['"]+$/g, "");
if (!dbUrl) throw new Error("DATABASE_URL is not set");

const sql = neon(dbUrl);

async function migrateProvincePrivacyPrivate() {
  console.log("Migrating users.is_province_public default to false...");
  await sql`
    ALTER TABLE users 
    ALTER COLUMN is_province_public SET DEFAULT false
  `;

  console.log("Updating existing students to is_province_public = false...");
  await sql`
    UPDATE users 
    SET is_province_public = false 
    WHERE role = 'student'
  `;

  console.log("✅ Province privacy defaults migrated to false successfully.");
}

migrateProvincePrivacyPrivate().catch((error) => {
  console.error("❌ Province privacy migration failed:", error);
  process.exit(1);
});
