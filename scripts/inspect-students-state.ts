import { config } from "dotenv";
config({ path: ".env.local" });
import { readFileSync } from "fs";
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "../src/db/schema/users";
import { eq, inArray } from "drizzle-orm";

const CLASS_CODE = "JVNUPL";
const dbUrl = (process.env.DATABASE_URL ?? "").replace(/^['"]+|['"]+$/g, "");
const sql = neon(dbUrl);
const db = drizzle(sql, { schema });

async function main() {
  const students: { username: string; name: string }[] = JSON.parse(
    readFileSync("scripts/parsed_students.json", "utf8")
  );
  const usernames = students.map((s) => s.username);

  const [cls] = await db
    .select()
    .from(schema.classes)
    .where(eq(schema.classes.code, CLASS_CODE))
    .limit(1);
  console.log("CLASS:", cls ? { id: cls.id, name: cls.name, teacherId: cls.teacherId } : "NOT FOUND");

  const existing = await db
    .select({ id: schema.users.id, username: schema.users.username, displayName: schema.users.displayName, classId: schema.users.classId })
    .from(schema.users)
    .where(inArray(schema.users.username, usernames));

  console.log(`PARSED students: ${students.length}`);
  console.log(`EXISTING in DB (by username): ${existing.length}`);
  console.log("SAMPLE existing (first 5):", existing.slice(0, 5));
  const missing = usernames.filter((u) => !existing.some((e) => e.username === u));
  console.log(`MISSING (would be inserted): ${missing.length}`);
  console.log("SAMPLE missing (first 5):", missing.slice(0, 5));
}

main().then(() => process.exit(0)).catch((e) => { console.error(e); process.exit(1); });
