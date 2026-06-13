import { config } from "dotenv";
config({ path: ".env.local" });
import { readFileSync, writeFileSync } from "fs";
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "../src/db/schema/users";
import { hashPassword } from "../src/lib/password";
import { eq } from "drizzle-orm";

const DEFAULT_PASSWORD = "kesararam5";
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
  name: string;
  gender: string;
  username?: string;
}

async function main() {
  console.log("Reading parsed students JSON...");
  const rawData = readFileSync(JSON_FILE_PATH, "utf8");
  const excelStudents: ExcelStudent[] = JSON.parse(rawData);

  console.log(`Loaded ${excelStudents.length} students from JSON.`);

  console.log("Fetching existing usernames and emails from database to prevent duplicates...");
  const existingUsers = await db
    .select({
      username: schema.users.username,
      email: schema.users.email,
    })
    .from(schema.users);

  const seenUsernames = new Set<string>();
  const seenEmails = new Set<string>();

  existingUsers.forEach((u) => {
    seenUsernames.add(u.username.toLowerCase());
    seenEmails.add(u.email.toLowerCase());
  });

  console.log(`Found ${existingUsers.length} existing users in the database.`);

  const usersToInsert = [];
  const credentialsList = [];

  const passwordHash = hashPassword(DEFAULT_PASSWORD);

  for (const s of excelStudents) {
    let baseUsername = s.username || "student";
    let username = baseUsername;
    let counter = 2;

    // Ensure username is unique against both DB and other inserted students
    while (seenUsernames.has(username)) {
      username = `${baseUsername}${counter}`;
      counter += 1;
    }
    seenUsernames.add(username);

    // Ensure email is unique
    let baseEmail = `${username}@kesararam.edu.kh`;
    let email = baseEmail;
    counter = 2;
    while (seenEmails.has(email)) {
      email = `${username}${counter}@kesararam.edu.kh`;
      counter += 1;
    }
    seenEmails.add(email);

    usersToInsert.push({
      username,
      email,
      passwordHash,
      role: "student" as const,
      displayName: s.name,
      isActive: true,
      isSuspended: false,
      loginAttempts: 0,
      schoolName: null,
      province: null,
      gradeLevel: null,
      section: null,
      classId: null,
    });

    credentialsList.push({
      no: s.no,
      name: s.name,
      gender: s.gender,
      username: username,
      password: DEFAULT_PASSWORD,
    });
  }

  console.log(`Inserting ${usersToInsert.length} students into the database...`);
  
  // Insert users in batches or one by one
  let insertedCount = 0;
  for (const user of usersToInsert) {
    try {
      await db.insert(schema.users).values(user);
      insertedCount++;
    } catch (err) {
      console.error(`Failed to insert student ${user.displayName} (@${user.username}):`, err);
    }
  }

  console.log(`Successfully inserted ${insertedCount} / ${usersToInsert.length} students.`);

  // Write credentials text file for the teacher
  let txtContent = "បញ្ជីឈ្មោះ និងគណនីសិស្សថ្នាក់ទី ៥ (Grade 5 Student Accounts)\n";
  txtContent += "========================================================\n\n";
  txtContent += String("ល.រ").padEnd(6) + " | " + 
                 String("ឈ្មោះ").padEnd(25) + " | " + 
                 String("ភេទ").padEnd(5) + " | " + 
                 String("គណនី (Username)").padEnd(20) + " | " + 
                 String("លេខសម្ងាត់ (Password)\n");
  txtContent += "-".repeat(90) + "\n";

  for (const c of credentialsList) {
    txtContent += `${String(c.no).padEnd(6)} | ${c.name.padEnd(25)} | ${c.gender.padEnd(5)} | ${c.username.padEnd(20)} | ${c.password}\n`;
  }

  writeFileSync(CREDENTIALS_TXT_PATH, txtContent, "utf8");
  console.log(`Credentials saved to ${CREDENTIALS_TXT_PATH}`);
  console.log("\n========================================================");
  console.log("INSERTION COMPLETE! HERE ARE THE FIRST 10 ACCOUNTS:");
  console.log("========================================================");
  credentialsList.slice(0, 10).forEach((c) => {
    console.log(`No. ${c.no} - ${c.name} (${c.gender}) -> Username: @${c.username} / Password: ${c.password}`);
  });
  console.log("... and 79 more.");
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("Fatal execution error:", err);
    process.exit(1);
  });
