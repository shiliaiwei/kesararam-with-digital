import { config } from "dotenv";
config({ path: ".env.local" });

import { db } from "../src/lib/db";
import { questions, topics, answers } from "../src/db/schema/content";
import { eq, like, or } from "drizzle-orm";

async function run() {
  console.log("Searching for the matching question...");
  
  const foundByCode = await db
    .select({
      id: questions.id,
      questionEn: questions.questionEn,
      questionKm: questions.questionKm,
      topicCode: topics.topicCode,
    })
    .from(questions)
    .innerJoin(topics, eq(questions.topicId, topics.id))
    .where(eq(topics.topicCode, "RTE-0021"));

  console.log("By code RTE-0021:", foundByCode);

  const foundByText = await db
    .select({
      id: questions.id,
      questionEn: questions.questionEn,
      questionKm: questions.questionKm,
      topicCode: topics.topicCode,
    })
    .from(questions)
    .innerJoin(topics, eq(questions.topicId, topics.id))
    .where(
      or(
        like(questions.questionKm, "%ផ្គូផ្គង%"),
        like(questions.questionEn, "%Match each%")
      )
    );

  console.log("By text match:", foundByText);

  // For any found question, retrieve all its answers
  const allFound = [...foundByCode, ...foundByText];
  const uniqueIds = Array.from(new Set(allFound.map(q => q.id)));

  for (const qId of uniqueIds) {
    const qAnswers = await db
      .select()
      .from(answers)
      .where(eq(answers.questionId, qId));
    console.log(`\nAnswers for Question ID ${qId}:`);
    for (const ans of qAnswers) {
      console.log(`- ID: ${ans.id}, En: "${ans.answerEn}", Km: "${ans.answerKm}", Correct: ${ans.isCorrect}`);
    }
  }

  process.exit(0);
}

run().catch(err => {
  console.error("Error:", err);
  process.exit(1);
});
