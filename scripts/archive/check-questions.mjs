import { db } from "../src/lib/db.js";
import { questions, topics, categories, answers } from "../src/db/schema/content.js";
import { eq, inArray, sql } from "drizzle-orm";

async function checkQuestions() {
  console.log("Checking questions in database...\n");

  // Get all categories
  const allCategories = await db.select().from(categories);
  console.log(`Total categories: ${allCategories.length}`);
  
  for (const cat of allCategories) {
    console.log(`\n📁 Category: ${cat.titleEn} (ID: ${cat.id})`);
    
    // Get topics in this category
    const catTopics = await db.select().from(topics).where(eq(topics.categoryId, cat.id));
    console.log(`   Topics: ${catTopics.length}`);
    
    // Get questions in this category
    const catQuestions = await db
      .select({ id: questions.id, status: questions.status, difficulty: questions.difficulty })
      .from(questions)
      .innerJoin(topics, eq(questions.topicId, topics.id))
      .where(eq(topics.categoryId, cat.id));
    
    console.log(`   Questions: ${catQuestions.length}`);
    
    if (catQuestions.length > 0) {
      const approved = catQuestions.filter(q => q.status === "approved").length;
      const draft = catQuestions.filter(q => q.status === "draft").length;
      console.log(`   - Approved: ${approved}`);
      console.log(`   - Draft: ${draft}`);
      
      // Check answer counts
      const qIds = catQuestions.map(q => q.id);
      const answerCounts = await db
        .select({ questionId: answers.questionId, count: sql`count(*)::int` })
        .from(answers)
        .where(inArray(answers.questionId, qIds))
        .groupBy(answers.questionId);
      
      const countMap = new Map(answerCounts.map(a => [a.questionId, a.count]));
      const with2Answers = catQuestions.filter(q => countMap.get(q.id) === 2).length;
      const with4Answers = catQuestions.filter(q => countMap.get(q.id) === 4).length;
      
      console.log(`   - With 2 answers (true/false): ${with2Answers}`);
      console.log(`   - With 4 answers (MCQ): ${with4Answers}`);
    }
  }
  
  console.log("\n✅ Check complete");
  process.exit(0);
}

checkQuestions().catch(err => {
  console.error("Error:", err);
  process.exit(1);
});
