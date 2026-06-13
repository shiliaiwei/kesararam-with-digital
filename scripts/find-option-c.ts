import { config } from "dotenv";
config({ path: ".env.local" });

import { db } from "../src/lib/db";
import { questions, topics, answers } from "../src/db/schema/content";
import { eq, like, or } from "drizzle-orm";

async function run() {
  console.log("Searching for the question containing option C...");

  const foundAnswers = await db
    .select({
      id: answers.id,
      questionId: answers.questionId,
      answerEn: answers.answerEn,
      answerKm: answers.answerKm,
      isCorrect: answers.isCorrect,
    })
    .from(answers)
    .where(
      or(
        like(answers.answerKm, "%១២%"),
        like(answers.answerKm, "%12%"),
        like(answers.answerKm, "%ឧបសគ្គ%")
      )
    );

  console.log(`Found ${foundAnswers.length} answers matching condition.`);
  for (const ans of foundAnswers) {
    console.log(`- Answer ID: ${ans.id}, Q ID: ${ans.questionId}, Correct: ${ans.isCorrect}`);
    console.log(`  En: "${ans.answerEn}"`);
    console.log(`  Km: "${ans.answerKm}"`);
    
    const qList = await db.select().from(questions).where(eq(questions.id, ans.questionId));
    if (qList.length > 0) {
      console.log(`  Question En: "${qList[0].questionEn}"`);
      console.log(`  Question Km: "${qList[0].questionKm}"`);
    }
  }

  process.exit(0);
}

run().catch(err => {
  console.error("Error:", err);
  process.exit(1);
});
