import { config } from "dotenv";
config({ path: ".env.local" });

import { db } from "../src/lib/db";
import { questions, topics, answers } from "../src/db/schema/content";
import { eq } from "drizzle-orm";

async function run() {
  console.log("Fetching all answers...");
  const allAnswers = await db.select().from(answers);
  console.log(`Fetched ${allAnswers.length} answers.`);

  const matches = allAnswers.filter(a => {
    const km = a.answerKm || "";
    const en = a.answerEn || "";
    return (
      km.includes("ស្រុត") ||
      km.includes("ចិញ្ចើម") ||
      km.includes("១២") ||
      km.includes("12") ||
      en.toLowerCase().includes("sunken") ||
      en.toLowerCase().includes("shoulder") ||
      en.toLowerCase().includes("12") ||
      en.toLowerCase().includes("obstacle") ||
      km.includes("ឧបសគ្គ")
    );
  });

  console.log(`Found ${matches.length} matches in JS memory filter.`);
  for (const a of matches) {
    // Print all matches so we don't miss anything, but filter out 125/125cc/125 សេសេ
    const enLower = a.answerEn.toLowerCase();
    if (enLower.includes("125") || a.answerKm.includes("១២៥")) {
      continue;
    }
    console.log(`- ID: ${a.id}, QID: ${a.questionId}, Correct: ${a.isCorrect}`);
    console.log(`  En: "${a.answerEn}"`);
    console.log(`  Km: "${a.answerKm}"`);
    
    const qList = await db.select().from(questions).where(eq(questions.id, a.questionId));
    if (qList.length > 0) {
      console.log(`  Q En: "${qList[0].questionEn}"`);
      console.log(`  Q Km: "${qList[0].questionKm}"`);
    }
  }

  process.exit(0);
}

run().catch(err => {
  console.error("Error:", err);
  process.exit(1);
});
