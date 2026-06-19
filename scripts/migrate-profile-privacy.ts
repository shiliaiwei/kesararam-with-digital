import { neon } from "@neondatabase/serverless";
import { config } from "dotenv";

config({ path: ".env.local" });

const dbUrl = (process.env.DATABASE_URL ?? "").replace(/^['\"]+|['\"]+$/g, "");
if (!dbUrl) throw new Error("DATABASE_URL is not set");

const sql = neon(dbUrl);

async function migrateProfilePrivacy() {
  await sql`
    ALTER TABLE users
    ADD COLUMN IF NOT EXISTS is_class_public BOOLEAN DEFAULT true NOT NULL
  `;

  await sql`
    ALTER TABLE users
    ALTER COLUMN is_profile_public SET DEFAULT true,
    ALTER COLUMN is_name_public SET DEFAULT true,
    ALTER COLUMN is_username_public SET DEFAULT true,
    ALTER COLUMN is_school_public SET DEFAULT false,
    ALTER COLUMN is_province_public SET DEFAULT true,
    ALTER COLUMN is_grade_public SET DEFAULT true,
    ALTER COLUMN is_section_public SET DEFAULT true,
    ALTER COLUMN is_stats_public SET DEFAULT true
  `;

  await sql`
    UPDATE users
    SET is_profile_public = true,
        is_name_public = true,
        is_username_public = true,
        is_school_public = false,
        is_province_public = true,
        is_class_public = true,
        is_grade_public = true,
        is_section_public = true,
        is_stats_public = true
    WHERE role = 'student'
  `;

  console.log("Profile privacy defaults migrated successfully.");
}

migrateProfilePrivacy().catch((error) => {
  console.error("Profile privacy migration failed:", error);
  process.exit(1);
});
