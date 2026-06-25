import { sql } from "../src/lib/db";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

async function run() {
  console.log("Creating mock pending question for testing...");
  
  // Find a topic
  const topicResult = await sql`
    SELECT id, name_en, topic_code FROM topics LIMIT 1
  `;
  const topic = topicResult[0];
  if (!topic) {
    console.error("No topics found in the database. Please seed or create a topic first.");
    process.exit(1);
  }
  
  console.log(`Targeting Topic: ${topic.name_en} (${topic.topic_code})`);

  // Insert mock pending question
  const questionResult = await sql`
    INSERT INTO questions (
      topic_id,
      question_en,
      question_km,
      difficulty,
      status,
      points_multiplier,
      created_at
    ) VALUES (
      ${topic.id},
      'TEST PENDING QUESTION: What is the maximum speed limit in urban areas?',
      'សំណួរសាកល្បង៖ តើល្បឿនអតិបរមាសម្រាប់ការបើកបរក្នុងទីប្រជុំជនគឺប៉ុន្មាន?',
      'easy',
      'pending',
      2,
      NOW()
    )
    RETURNING id
  `;
  const questionId = questionResult[0].id;

  // Insert answers
  await sql`
    INSERT INTO answers (question_id, answer_type, answer_en, answer_km, is_correct, sort_order)
    VALUES 
      (${questionId}, 'multiple_choice', '40 km/h', '៤០ គីឡូម៉ែត្រ/ម៉ោង', true, 0),
      (${questionId}, 'multiple_choice', '60 km/h', '៦០ គីឡូម៉ែត្រ/ម៉ោង', false, 1)
  `;

  console.log(`Successfully created pending question (ID: ${questionId}) for topic (ID: ${topic.id})!`);
  console.log("You can now open the Admin Review Queue page or Admin Questions Panel and look for the 'Pending' status filter to see this question.");
  process.exit(0);
}

run().catch((e) => {
  console.error("Failed to seed sample question:", e);
  process.exit(1);
});
