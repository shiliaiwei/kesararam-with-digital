import { neon } from "@neondatabase/serverless";
import { readFileSync } from "fs";

const env = readFileSync(".env.local", "utf8");
const url = env
  .match(/^DATABASE_URL=(.+)$/m)[1]
  .trim()
  .replace(/^['"]|['"]$/g, "");
const sql = neon(url);

const users =
  await sql`SELECT id, username, email, is_active FROM users ORDER BY id`;
users.forEach((u) => console.log(u.id, u.username, u.email, u.is_active));
