import { db } from "../src/lib/db";
import { users } from "../src/db/schema";
import { desc, sql } from "drizzle-orm";
import { config } from "dotenv";

config({ path: ".env.local" });

// Use raw SQL text to force fully qualified "users"."id" references, preventing subquery shadowing
const priorityExpr = sql<number>`COALESCE((SELECT SUM(pl.points) FROM points_ledger pl WHERE pl.user_id = users.id AND pl.source LIKE 'live-session:%'), 0)::int`;
const soloExpr = sql<number>`COALESCE((SELECT SUM(pl.points) FROM points_ledger pl WHERE pl.user_id = users.id AND pl.source = 'solo'), 0)::int`;
const accuracyExpr = sql<number>`COALESCE((SELECT ROUND(AVG(CASE WHEN gs.total_questions > 0 THEN gs.correct_answers::numeric / gs.total_questions END) * 100) FROM game_scores gs WHERE gs.user_id = users.id), 0)::int`;

const publicFilter = sql`${users.isActive} = true AND ${users.role} = 'student' AND ${users.lifetimePoints} > 0`;

async function printSQL() {
  try {
    const query = db
      .select({
        id: users.id,
        username: users.username,
        priorityPoints: priorityExpr,
        soloPoints: soloExpr,
        accuracy: accuracyExpr,
      })
      .from(users)
      .where(publicFilter)
      .orderBy(desc(users.lifetimePoints))
      .limit(10);
      
    const compiled = query.toSQL();
    console.log("Generated SQL:");
    console.log(compiled.sql);
    console.log("\nParameters:", compiled.params);

    const rows = await query;
    console.log("\nQuery Results:", JSON.stringify(rows, null, 2));

  } catch (error) {
    console.error("Error generating SQL:", error);
  }
}

printSQL();
