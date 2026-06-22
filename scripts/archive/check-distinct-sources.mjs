import { neon } from "@neondatabase/serverless";
import { readFileSync } from "fs";
const env = readFileSync(".env.local", "utf8");
const url = env.match(/^DATABASE_URL=(.+)$/m)[1].trim().replace(/^['"]|['"]$/g, "");
const sql = neon(url);

const sources = await sql`SELECT DISTINCT source FROM points_ledger`;
console.log("Distinct sources:", sources);
process.exit(0);
