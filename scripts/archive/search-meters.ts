import { config } from "dotenv";
config({ path: ".env.local" });

import { db } from "../src/lib/db";
import { questions, topics, answers } from "../src/db/schema/content";
import { eq, like } from "drizzle-orm";

async function run() {
  console.log("Searching database for answers containing ម៉ែត្រ (meters)...");

  const foundAnswers = await db
    .select({
      id: answers.id,
      questionId: answers.questionId,
      answerEn: answers.answerEn,
      answerKm: answers.answerKm,
      isCorrect: answers.isCorrect,
    })
    .from(answers)
    .where(like(answers.answerKm, "%ម៉ែត្រ%"));

  console.log(`Found ${foundAnswers.length} answers containing 'ម៉ែត្រ'.`);
  for (const ans of foundAnswers) {
    console.log(`- Answer ID: ${ans.id}, Q ID: ${ans.questionId}, Correct: ${ans.isCorrect}`);
    console.log(`  En: "${ans.answerEn}"`);
    console.log(`  Km: "${ans.answerKm}"`);
    
    const qList = await db.select().from(questions).where(eq(questions.id, ans.questionId));
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
