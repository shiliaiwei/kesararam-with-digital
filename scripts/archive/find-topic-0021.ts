import { config } from "dotenv";
config({ path: ".env.local" });

import { db } from "../src/lib/db";
import { questions, topics, answers } from "../src/db/schema/content";
import { eq, like, or } from "drizzle-orm";

async function run() {
  console.log("Searching for topics with 21 or 0021 in code...");

  const foundTopics = await db
    .select()
    .from(topics)
    .where(
      or(
        like(topics.topicCode, "%21%"),
        like(topics.topicCode, "%0021%"),
        like(topics.topicCode, "%RTL%")
      )
    );

  console.log(`Found ${foundTopics.length} topics containing 'RTL' or '21'.`);
  
  const topicsWith21 = foundTopics.filter(t => t.topicCode.includes("21"));
  console.log("Topics with 21 in code:");
  for (const t of topicsWith21) {
    console.log(`- ID: ${t.id}, Code: "${t.topicCode}", NameEn: "${t.nameEn}"`);
  }

  process.exit(0);
}

run().catch(err => {
  console.error("Error:", err);
  process.exit(1);
});
