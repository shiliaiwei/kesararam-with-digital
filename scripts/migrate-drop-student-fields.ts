import { neon } from "@neondatabase/serverless";
import { config } from "dotenv";

config({ path: ".env.local" });

const dbUrl = (process.env.DATABASE_URL ?? "").replace(/^['"]+|['"]+$/g, "");
if (!dbUrl) throw new Error("DATABASE_URL is not set");

const sql = neon(dbUrl);

/**
 * Drops the per-student fields we no longer collect:
 *   users.grade_level, users.section, users.parent_contact
 *
 * Grade and section now live ONLY on the classes table (a class-level attribute);
 * a student's grade/section is derived from the class they enrol in. Parent
 * contact is removed entirely.
 *
 * NOTE: This is destructive and irreversible — the column data is permanently
 * deleted. The privacy-flag columns (is_grade_public, is_section_public) are
 * intentionally left in place; they are now unused but harmless.
 */
async function migrate() {
  try {
    console.log("Running migration: drop users.grade_level, users.section, users.parent_contact");

    await sql`ALTER TABLE users DROP COLUMN IF EXISTS grade_level`;
    console.log("  • dropped users.grade_level");

    await sql`ALTER TABLE users DROP COLUMN IF EXISTS section`;
    console.log("  • dropped users.section");

    await sql`ALTER TABLE users DROP COLUMN IF EXISTS parent_contact`;
    console.log("  • dropped users.parent_contact");

    console.log("✅ Migration completed successfully!");
  } catch (error) {
    console.error("❌ Migration failed:", error);
    process.exit(1);
  }
}

migrate();
