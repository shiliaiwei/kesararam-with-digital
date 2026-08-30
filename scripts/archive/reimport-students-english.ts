/**
 * Wipe & re-import the 91 Grade-5 students FRESH with English fullname + username,
 * regenerated 6-char passwords (3 username letters + 3 digits), auto-enrolled in
 * class JVNUPL (linked to its teacher). Safe to re-run: deletes any existing
 * account by username first (class_enrollments cascade-delete), then inserts.
 *
 * Verified before writing: the only dependent rows for these students are
 * class_enrollments (ON DELETE CASCADE); all other user FKs have 0 rows.
 */
import { config } from "dotenv";
config({ path: ".env.local" });
import { readFileSync, writeFileSync } from "fs";
import { randomInt } from "crypto";
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "../src/db/schema/users";
import { hashPassword } from "../src/lib/password";
import { eq, inArray } from "drizzle-orm";

const CLASS_CODE = "JVNUPL";
const JSON_FILE_PATH = "scripts/parsed_students.json";
const CREDENTIALS_TXT_PATH = "scripts/generated_credentials.txt";

const dbUrl = (process.env.DATABASE_URL ?? "").replace(/^['"]+|['"]+$/g, "");
if (!dbUrl) {
  console.error("DATABASE_URL is not set in environment");
  process.exit(1);
}
const sql = neon(dbUrl);
const db = drizzle(sql, { schema });

interface ExcelStudent {
  no: string;
  name: string; // Khmer
  gender: string;
  username: string; // English
  fullname: string; // English (Title Case)
}

/** 6-char password derived from the username: 3 lowercase letters + 3 digits. */
function makePassword(username: string): string {
  const prefix = username.toLowerCase().replace(/[^a-z]/g, "").slice(0, 3).padEnd(3, "s");
  const digits = randomInt(100, 1000).toString();
  return prefix + digits;
}

async function main() {
  const students: ExcelStudent[] = JSON.parse(readFileSync(JSON_FILE_PATH, "utf8"));
  console.log(`Loaded ${students.length} students from JSON.`);

  // 1. Resolve target class (+ teacher).
  const [cls] = await db
    .select()
    .from(schema.classes)
    .where(eq(schema.classes.code, CLASS_CODE))
    .limit(1);
  if (!cls) {
    console.error(`Class '${CLASS_CODE}' not found.`);
    process.exit(1);
  }
  console.log(`Class: id=${cls.id} name=${cls.name} teacherId=${cls.teacherId}`);

  // 2. Wipe any existing accounts for these usernames (enrollments cascade).
  const usernames = students.map((s) => s.username);
  const deleted = await db
    .delete(schema.users)
    .where(inArray(schema.users.username, usernames))
    .returning({ id: schema.users.id });
  console.log(`Wiped ${deleted.length} existing accounts (and their enrollments).`);

  // 3. Track collisions against the rest of the DB.
  const others = await db
    .select({ username: schema.users.username, email: schema.users.email })
    .from(schema.users);
  const seenUsernames = new Set(others.map((u) => u.username.toLowerCase()));
  const seenEmails = new Set(others.map((u) => u.email.toLowerCase()));

  const credentials: { no: string; name: string; fullname: string; gender: string; username: string; password: string }[] = [];

  // 4. Insert fresh + enroll.
  for (const s of students) {
    let username = s.username || "student";
    let n = 2;
    while (seenUsernames.has(username.toLowerCase())) username = `${s.username}${n++}`;
    seenUsernames.add(username.toLowerCase());

    let email = `${username}@kesararam.edu.kh`;
    n = 2;
    while (seenEmails.has(email.toLowerCase())) email = `${username}${n++}@kesararam.edu.kh`;
    seenEmails.add(email.toLowerCase());

    const password = makePassword(username);

    const [user] = await db
      .insert(schema.users)
      .values({
        username,
        email,
        passwordHash: hashPassword(password),
        role: "student" as const,
        displayName: s.fullname, // English fullname
        isActive: true,
        isSuspended: false,
        loginAttempts: 0,
        schoolName: cls.schoolName,
        province: cls.province,
        classId: cls.id,
      })
      .returning({ id: schema.users.id });

    await db.insert(schema.classEnrollments).values({
      classId: cls.id,
      studentId: user.id,
      enrolledBy: cls.teacherId,
      enrolledAt: new Date(),
    });

    credentials.push({ no: s.no, name: s.name, fullname: s.fullname, gender: s.gender, username, password });
  }

  console.log(`Inserted + enrolled ${credentials.length} students in ${CLASS_CODE}.`);

  // 5. Write credentials reference file.
  let txt = `Grade 5 student accounts — class ${CLASS_CODE} (regenerated)\n`;
  txt += "=".repeat(90) + "\n\n";
  txt += "No  | Khmer name              | English fullname          | G | Username             | Password\n";
  txt += "-".repeat(110) + "\n";
  for (const c of credentials) {
    txt += `${String(c.no).padEnd(3)} | ${c.name.padEnd(22)} | ${c.fullname.padEnd(24)} | ${c.gender.padEnd(1)} | ${c.username.padEnd(20)} | ${c.password}\n`;
  }
  writeFileSync(CREDENTIALS_TXT_PATH, txt, "utf8");
  console.log(`Credentials written to ${CREDENTIALS_TXT_PATH}`);

  console.log("\nFirst 10 accounts:");
  credentials.slice(0, 10).forEach((c) =>
    console.log(`  #${c.no} ${c.fullname} (${c.gender}) -> @${c.username} / ${c.password}`)
  );
}

main().then(() => process.exit(0)).catch((e) => { console.error("Fatal:", e); process.exit(1); });
