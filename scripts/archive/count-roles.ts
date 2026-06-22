import { neon } from "@neondatabase/serverless";
import { readFileSync } from "fs";

const env = readFileSync(".env.local", "utf8");
const url = env.match(/^DATABASE_URL=(.+)$/m)[1].trim().replace(/^['"]|['"]$/g, "");
const sql = neon(url);

async function main() {
  const roles = await sql`
    SELECT role, COUNT(*), ARRAY_AGG(username) as usernames
    FROM users 
    GROUP BY role
  `;
  console.log("Roles overview:\n", JSON.stringify(roles, null, 2));
}

main().catch(console.error);
