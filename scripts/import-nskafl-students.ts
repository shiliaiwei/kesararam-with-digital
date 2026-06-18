import { config } from "dotenv";
config({ path: ".env.local" });

import { readFileSync, writeFileSync } from "fs";
import { neon } from "@neondatabase/serverless";
import { hashPassword } from "../src/lib/password";

const CLASS_CODE = "NSKAFL";
const PASSWORD_LIST_PATH = "/Users/Apple16/Downloads/kwd_password_list_no_contact_id21_removed.txt";
const PARSED_STUDENTS_PATH = "scripts/parsed_students.json";
const OUTPUT_CREDENTIALS_PATH = "/Users/Apple16/Downloads/kwd_nskafl_imported_credentials.txt";

type ParsedStudent = {
  no: string;
  name: string;
  gender: string;
  username: string;
  fullname: string;
};

type PasswordRow = {
  sourceId: number;
  khmerName: string;
  password: string;
  username: string;
  gender: string;
};

function normalizeKhmerName(name: string): string {
  return name
    .replace(/\u200b/g, "")
    .replace(/\(បោះបង់\)/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function readPasswordRows(): PasswordRow[] {
  const parsedStudents = JSON.parse(readFileSync(PARSED_STUDENTS_PATH, "utf8")) as ParsedStudent[];
  const lines = readFileSync(PASSWORD_LIST_PATH, "utf8").split(/\r?\n/);

  const rows: PasswordRow[] = [];
  const mismatches: string[] = [];

  for (const line of lines) {
    const match = line.match(/^\s*(\d+)\s+(.+?)\s+([A-Za-z0-9]{8})\s*$/);
    if (!match) continue;

    const sourceId = Number(match[1]);
    const khmerName = match[2].trim();
    const password = match[3];
    const parsed = parsedStudents[sourceId - 1];

    if (!parsed) {
      mismatches.push(`ID ${sourceId}: no matching parsed_students row`);
      continue;
    }

    if (normalizeKhmerName(parsed.name) !== normalizeKhmerName(khmerName)) {
      mismatches.push(`ID ${sourceId}: "${khmerName}" did not match "${parsed.name}"`);
      continue;
    }

    rows.push({
      sourceId,
      khmerName,
      password,
      username: parsed.username,
      gender: parsed.gender,
    });
  }

  if (mismatches.length > 0) {
    throw new Error(`Password list validation failed:\n${mismatches.join("\n")}`);
  }

  const ids = new Set(rows.map((row) => row.sourceId));
  if (rows.length !== 90 || ids.has(21)) {
    throw new Error(`Expected exactly 90 rows with ID 21 removed; got ${rows.length} rows.`);
  }

  return rows;
}

async function main() {
  const dbUrl = (process.env.DATABASE_URL ?? "").replace(/^['"]+|['"]+$/g, "");
  if (!dbUrl) throw new Error("DATABASE_URL is not set");

  const sql = neon(dbUrl);
  const rows = readPasswordRows();

  const [targetClass] = await sql`
    SELECT id, code, name, school_name, province, teacher_id
    FROM classes
    WHERE code = ${CLASS_CODE}
    LIMIT 1
  `;

  if (!targetClass) {
    throw new Error(`Class ${CLASS_CODE} was not found`);
  }

  const usernames = rows.map((row) => row.username);
  const emails = rows.map((row) => `${row.username}@kesararam.edu.kh`);

  const existingUsers = await sql`
    SELECT id, username, email, role
    FROM users
    WHERE username = ANY(${usernames}) OR email = ANY(${emails})
  `;

  const unsafeConflicts = existingUsers.filter((user) => {
    const matchingUsername = rows.some((row) => row.username === user.username);
    const matchingEmail = rows.some((row) => `${row.username}@kesararam.edu.kh` === user.email);
    return user.role !== "student" || matchingUsername !== matchingEmail;
  });

  if (unsafeConflicts.length > 0) {
    throw new Error(`Unsafe existing user/email conflicts: ${JSON.stringify(unsafeConflicts)}`);
  }

  const results = await sql.transaction(
    rows.map((row) => {
      const email = `${row.username}@kesararam.edu.kh`;
      const passwordHash = hashPassword(row.password);

      return sql`
        WITH upserted_user AS (
          INSERT INTO users (
            username,
            email,
            password_hash,
            role,
            display_name,
            school_name,
            province,
            class_id,
            is_active,
            is_suspended,
            login_attempts,
            created_by,
            updated_at
          )
          VALUES (
            ${row.username},
            ${email},
            ${passwordHash},
            'student',
            ${row.khmerName},
            ${targetClass.school_name},
            ${targetClass.province},
            ${targetClass.id},
            true,
            false,
            0,
            ${targetClass.teacher_id},
            now()
          )
          ON CONFLICT (username) DO UPDATE SET
            email = EXCLUDED.email,
            password_hash = EXCLUDED.password_hash,
            role = EXCLUDED.role,
            display_name = EXCLUDED.display_name,
            school_name = EXCLUDED.school_name,
            province = EXCLUDED.province,
            class_id = EXCLUDED.class_id,
            is_active = EXCLUDED.is_active,
            is_suspended = EXCLUDED.is_suspended,
            login_attempts = EXCLUDED.login_attempts,
            created_by = EXCLUDED.created_by,
            updated_at = now()
          RETURNING id, username
        ),
        enrolled AS (
          INSERT INTO class_enrollments (class_id, student_id, enrolled_by, enrolled_at)
          SELECT ${targetClass.id}, id, ${targetClass.teacher_id}, now()
          FROM upserted_user
          WHERE NOT EXISTS (
            SELECT 1
            FROM class_enrollments
            WHERE class_id = ${targetClass.id}
              AND student_id = upserted_user.id
          )
          RETURNING student_id
        )
        SELECT id, username
        FROM upserted_user
      `;
    }),
  );

  const imported = results.flat();

  let credentialText = `NSKAFL student accounts (Khmer display names)\n`;
  credentialText += `Class: ${targetClass.name} (${CLASS_CODE})\n`;
  credentialText += `Teacher ID: ${targetClass.teacher_id}\n`;
  credentialText += "=".repeat(92) + "\n";
  credentialText += "ID  | Khmer name                     | Username                  | Password\n";
  credentialText += "-".repeat(92) + "\n";

  for (const row of rows) {
    credentialText += `${String(row.sourceId).padEnd(3)} | ${row.khmerName.padEnd(30)} | ${row.username.padEnd(25)} | ${row.password}\n`;
  }

  writeFileSync(OUTPUT_CREDENTIALS_PATH, credentialText, "utf8");

  console.log(`Validated ${rows.length} password rows.`);
  console.log(`Upserted and enrolled ${imported.length} students into class ${CLASS_CODE}.`);
  console.log(`Credentials with usernames written to ${OUTPUT_CREDENTIALS_PATH}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
