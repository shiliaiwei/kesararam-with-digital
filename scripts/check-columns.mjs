import { neon } from "@neondatabase/serverless";
import { readFileSync } from "fs";
const env = readFileSync(".env.local", "utf8");
const url = env.match(/^DATABASE_URL=(.+)$/m)[1].trim().replace(/^['"]|['"]$/g, "");
const sql = neon(url);

const colsGameScores = await sql`
  SELECT column_name, data_type
  FROM information_schema.columns
  WHERE table_name = 'game_scores'
  ORDER BY ordinal_position
`;
console.log("=== game_scores columns ===");
console.log(colsGameScores);

const colsPointsLedger = await sql`
  SELECT column_name, data_type
  FROM information_schema.columns
  WHERE table_name = 'points_ledger'
  ORDER BY ordinal_position
`;
console.log("\n=== points_ledger columns ===");
console.log(colsPointsLedger);
process.exit(0);
