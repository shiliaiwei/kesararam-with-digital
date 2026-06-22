import { neon } from "@neondatabase/serverless";
import { config } from "dotenv";

config({ path: ".env.local" });

const sql = neon(process.env.DATABASE_URL);

try {
  await sql`ALTER TYPE "role" ADD VALUE IF NOT EXISTS 'staff'`;
  console.log("SUCCESS: 'staff' added to role enum");
} catch (e) {
  console.error("ERROR:", e.message);
}
