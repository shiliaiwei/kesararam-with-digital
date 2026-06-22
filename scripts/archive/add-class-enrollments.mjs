import { neon } from "@neondatabase/serverless";
import { config } from "dotenv";

config({ path: ".env.local" });

const sql = neon(process.env.DATABASE_URL);

try {
  await sql`
    CREATE TABLE IF NOT EXISTS "class_enrollments" (
      "id" serial PRIMARY KEY,
      "class_id" integer NOT NULL REFERENCES "classes"("id"),
      "student_id" integer NOT NULL REFERENCES "users"("id"),
      "enrolled_by" integer REFERENCES "users"("id"),
      "enrolled_at" timestamp DEFAULT now() NOT NULL,
      UNIQUE("class_id", "student_id")
    )
  `;
  console.log("SUCCESS: class_enrollments table created");
} catch (e) {
  console.error("ERROR:", e.message);
}
