import { neon } from "@neondatabase/serverless";
import { config } from "dotenv";

config({ path: ".env.local" });

const dbUrl = (process.env.DATABASE_URL ?? "").replace(/^['"]+|['"]+$/g, "");
if (!dbUrl) throw new Error("DATABASE_URL is not set");

const sql = neon(dbUrl);

async function run() {
  try {
    console.log("Adding 'individual' to plan_tier enum...");
    await sql`ALTER TYPE plan_tier ADD VALUE IF NOT EXISTS 'individual'`;
    console.log("✅ Enum value added successfully!");
  } catch (error) {
    console.error("❌ Migration failed:", error);
    process.exit(1);
  }
}

run();
