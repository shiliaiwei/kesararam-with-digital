import { config } from "dotenv";
config({ path: ".env.local" });

import { db } from "../src/lib/db";
import { questions } from "../src/db/schema/content";
import { eq, or } from "drizzle-orm";

async function run() {
  console.log("Disabling matching questions in the database...");

  const result = await db
    .update(questions)
    .set({ status: "inactive" })
    .where(
      or(
        eq(questions.questionEn, "Match each question with its correct answer."),
        eq(questions.questionKm, "ផ្គូផ្គងសំណួរនីមួយៗជាមួយចម្លើយត្រឹមត្រូវរបស់វា។")
      )
    )
    .returning({ id: questions.id });

  console.log(`Successfully disabled ${result.length} matching questions.`);
  process.exit(0);
}

run().catch(err => {
  console.error("Error:", err);
  process.exit(1);
});
