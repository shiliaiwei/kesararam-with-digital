import { neon } from "@neondatabase/serverless";
import { config } from "dotenv";

config({ path: ".env.local" });

const dbUrl = (process.env.DATABASE_URL ?? "").replace(/^['"]+|['"]+$/g, "");
if (!dbUrl) throw new Error("DATABASE_URL is not set");

const sql = neon(dbUrl);

/**
 * Makes the "official" MPWT-style plate the default for everyone.
 *
 *  1. Alters the column default so newly created users get "official".
 *  2. Switches EVERY existing user to "official" (per product decision —
 *     the official plate is now the universal default display).
 *
 * Re-runnable: the UPDATE is a no-op for rows already on "official".
 */
async function migrate() {
  try {
    console.log("Running migration: default score plate -> official");

    await sql`
      ALTER TABLE users
      ALTER COLUMN score_plate_style SET DEFAULT 'official'
    `;

    const switched = await sql`
      UPDATE users
      SET score_plate_style = 'official'
      WHERE score_plate_style <> 'official'
      RETURNING id
    `;
    console.log(`Switched ${switched.length} user(s) to the official plate`);

    console.log("✅ Migration completed successfully!");
  } catch (error) {
    console.error("❌ Migration failed:", error);
    process.exit(1);
  }
}

migrate();
