import { neon } from "@neondatabase/serverless";
import { config } from "dotenv";

config({ path: ".env.local" });

const dbUrl = (process.env.DATABASE_URL ?? "").replace(/^['"]+|['"]+$/g, "");
if (!dbUrl) throw new Error("DATABASE_URL is not set");

const sql = neon(dbUrl);

/**
 * Drops the class-level fields we no longer collect:
 *   classes.grade_level, classes.section
 *
 * Classes are now keyed on name + school + province only. Student-to-class
 * matching already keys on school + province (see classFieldsMatch), so this
 * is purely informational data being removed.
 *
 * NOTE: This is destructive and irreversible — the column data is permanently
 * deleted.
 */
async function migrate() {
  try {
    console.log("Running migration: drop classes.grade_level, classes.section");

    await sql`ALTER TABLE classes DROP COLUMN IF EXISTS grade_level`;
    console.log("  • dropped classes.grade_level");

    await sql`ALTER TABLE classes DROP COLUMN IF EXISTS section`;
    console.log("  • dropped classes.section");

    console.log("✅ Migration completed successfully!");
  } catch (error) {
    console.error("❌ Migration failed:", error);
    process.exit(1);
  }
}

migrate();
