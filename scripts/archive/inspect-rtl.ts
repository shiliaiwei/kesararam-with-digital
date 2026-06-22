import { config } from "dotenv";
config({ path: ".env.local" });

import { db } from "../src/lib/db";
import { questions, topics, answers } from "../src/db/schema/content";
import { eq } from "drizzle-orm";

async function run() {
  console.log("Inspecting RTL-Q001 and RTL-Q025...");

  for (const code of ["RTL-Q001", "RTL-Q025"]) {
    console.log(`\n--- Topic: ${code} ---`);
    const topicList = await db
      .select()
      .from(topics)
      .where(eq(topics.topicCode, code));
    
    if (topicList.length === 0) {
      console.log("Topic not found");
      continue;
    }
    const topic = topicList[0];
    console.log("Topic nameEn:", topic.nameEn);
    console.log("Topic nameKm:", topic.nameKm);

    const qList = await db
      .select()
      .from(questions)
      .where(eq(questions.topicId, topic.id));
    
    console.log(`Found ${qList.length} questions for this topic.`);
    for (const q of qList) {
      console.log(`- Question ID: ${q.id}`);
      console.log(`  En: "${q.questionEn}"`);
      console.log(`  Km: "${q.questionKm}"`);
      console.log(`  Type: ${q.questionType}, Status: ${q.status}`);
      
      const qAnswers = await db
        .select()
        .from(answers)
        .where(eq(answers.questionId, q.id));
      console.log(`  Answers (${qAnswers.length}):`);
      for (const ans of qAnswers) {
        console.log(`    * [ID: ${ans.id}] (Correct: ${ans.isCorrect})`);
        console.log(`      En: "${ans.answerEn}"`);
        console.log(`      Km: "${ans.answerKm}"`);
      }
    }
  }

  process.exit(0);
}

run().catch(err => {
  console.error("Error:", err);
  process.exit(1);
});
