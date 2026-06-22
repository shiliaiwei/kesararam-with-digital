import { config } from "dotenv";
config({ path: ".env.local" });

import { db } from "../src/lib/db";
import { questions, topics, answers } from "../src/db/schema/content";
import { eq, like, or, and, notLike } from "drizzle-orm";

async function run() {
  console.log("Searching database for English keywords: sunken, shoulder, 12, obstacle (excluding 125/១២៥)...");

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
      and(
        or(
          like(answers.answerEn, "%sunken%"),
          like(answers.answerEn, "%shoulder%"),
          like(answers.answerEn, "%12%"),
          like(answers.answerEn, "%obstacle%"),
          like(answers.answerKm, "%ស្រុត%"),
          like(answers.answerKm, "%១២%"),
          like(answers.answerKm, "%ឧបសគ្គ%")
        ),
        notLike(answers.answerEn, "%125%"),
        notLike(answers.answerKm, "%១២៥%")
      )
    );

  console.log(`Found ${foundAnswers.length} matching answers in db.`);
  for (const ans of foundAnswers) {
    console.log(`Answer ID: ${ans.id}, Q ID: ${ans.questionId}, Correct: ${ans.isCorrect}`);
    console.log(`  En: "${ans.answerEn}"`);
    console.log(`  Km: "${ans.answerKm}"`);
    
    const qList = await db.select().from(questions).where(eq(questions.id, ans.questionId));
    if (qList.length > 0) {
      console.log(`  Question ID: ${qList[0].id}, Type: ${qList[0].questionType}, Status: ${qList[0].status}`);
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
