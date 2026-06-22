import { neon } from "@neondatabase/serverless";
import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

const sql = neon(process.env.DATABASE_URL);

const rows = await sql`
  SELECT c.title_en as cat, COUNT(t.id)::int as topics,
    SUM((SELECT COUNT(*)::int FROM questions WHERE topic_id = t.id))::int as total_q
  FROM topics t
  JOIN categories c ON t.category_id = c.id
  GROUP BY c.title_en ORDER BY c.title_en
`;

console.log("\nCategory Summary:");
console.log("─".repeat(55));
rows.forEach(r => console.log(r.cat?.padEnd(28), "| topics:", String(r.topics).padStart(2), "| questions:", r.total_q));
console.log("─".repeat(55));
const totalQ = rows.reduce((s, r) => s + (r.total_q || 0), 0);
const totalT = rows.reduce((s, r) => s + (r.topics || 0), 0);
console.log("TOTAL".padEnd(28), "| topics:", String(totalT).padStart(2), "| questions:", totalQ);
