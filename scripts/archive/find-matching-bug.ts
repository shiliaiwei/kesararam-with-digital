import { config } from "dotenv";
config({ path: ".env.local" });

import { db } from "../src/lib/db";
import { questions, topics, answers } from "../src/db/schema/content";
import { eq, like, or } from "drizzle-orm";

async function run() {
  console.log("Searching for specific questions in db...");

  // Search questions containing "ផ្គូផ្គង"
  const foundQuestions = await db
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
        like(questions.questionKm, "%ផ្គូផ្គងសំណួរ%"),
        like(questions.questionKm, "%ផ្គូផ្គង%")
      )
    );

  console.log(`Found ${foundQuestions.length} questions matching 'ផ្គូផ្គង'.`);
  
  // Filter questions that do not have "priority scenario" or "សេណារីយ៉ូអាទិភាព"
  const filtered = foundQuestions.filter(q => 
    !q.questionEn.toLowerCase().includes("priority") &&
    !q.questionKm.includes("អាទិភាព")
  );

  console.log("Filtered questions (no priority):", filtered);

  // Search answers with text like "ហាមចត" or "យ៉ាងតិច ១០"
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
        like(answers.answerKm, "%ហាមចត%"),
        like(answers.answerKm, "%យ៉ាងតិច ១០%")
      )
    );

  console.log("\nFound matching answers:", foundAnswers);

  // For the question IDs in foundAnswers, let's print the question details
  const qIds = Array.from(new Set(foundAnswers.map(a => a.questionId)));
  if (qIds.length > 0) {
    const questionsForAnswers = await db
      .select({
        id: questions.id,
        questionEn: questions.questionEn,
        questionKm: questions.questionKm,
        topicCode: topics.topicCode,
      })
      .from(questions)
      .leftJoin(topics, eq(questions.topicId, topics.id))
      .where(or(...qIds.map(id => eq(questions.id, id))));
    
    console.log("\nQuestions associated with these answers:");
    for (const q of questionsForAnswers) {
      console.log(`- ID: ${q.id}, TopicCode: ${q.topicCode}, En: "${q.questionEn}", Km: "${q.questionKm}"`);
      // print all answers for this question
      const qAnswers = await db
        .select()
        .from(answers)
        .where(eq(answers.questionId, q.id));
      for (const ans of qAnswers) {
        console.log(`   * Ans ID: ${ans.id}, En: "${ans.answerEn}", Km: "${ans.answerKm}", Correct: ${ans.isCorrect}`);
      }
    }
  }

  process.exit(0);
}

run().catch(err => {
  console.error("Error:", err);
  process.exit(1);
});
