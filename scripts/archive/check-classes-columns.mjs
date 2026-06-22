import { neon } from "@neondatabase/serverless";
import { readFileSync } from "fs";
const env = readFileSync(".env.local", "utf8");
const url = env.match(/^DATABASE_URL=(.+)$/m)[1].trim().replace(/^['"]|['"]$/g, "");
const sql = neon(url);

const classes = await sql`
  SELECT * FROM classes LIMIT 5
`;
console.log("=== classes sample rows ===");
console.log(classes);
process.exit(0);
