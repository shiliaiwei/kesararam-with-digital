import { config } from "dotenv";
config({ path: ".env.local" });
import { readFileSync, writeFileSync } from "fs";
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
  name: string;
  gender: string;
  username?: string;
}

async function main() {
  console.log("Reading parsed students JSON...");
  const rawData = readFileSync(JSON_FILE_PATH, "utf8");
  const excelStudents: ExcelStudent[] = JSON.parse(rawData);
  console.log(`Loaded ${excelStudents.length} students from JSON.`);

  // 1. Fetch Class Details for JVNUPL
  console.log(`Querying details for class code: ${CLASS_CODE}...`);
  const [targetClass] = await db
    .select()
    .from(schema.classes)
    .where(eq(schema.classes.code, CLASS_CODE))
    .limit(1);

  if (!targetClass) {
    console.error(`Error: Class with code '${CLASS_CODE}' was not found in the database.`);
    process.exit(1);
  }

  console.log(`Class found: ID ${targetClass.id}, Name: ${targetClass.name}, Teacher ID: ${targetClass.teacherId}`);

  // Extract student usernames to delete
  const targetUsernames = excelStudents
    .map((s) => s.username)
    .filter((username): username is string => typeof username === "string");

  if (targetUsernames.length > 0) {
    console.log(`Deleting existing accounts for ${targetUsernames.length} students to clean up previous run...`);
    
    // First delete any class enrollments just in case (cascade should handle this, but let's be safe)
    const existingStudentRecords = await db
      .select({ id: schema.users.id })
      .from(schema.users)
      .where(inArray(schema.users.username, targetUsernames));
    
    const existingStudentIds = existingStudentRecords.map((r) => r.id);
    if (existingStudentIds.length > 0) {
      await db
        .delete(schema.classEnrollments)
        .where(inArray(schema.classEnrollments.studentId, existingStudentIds));
    }

    // Delete users
    await db
      .delete(schema.users)
      .where(inArray(schema.users.username, targetUsernames));
    
    console.log("Cleaned up existing accounts.");
  }

  // 2. Fetch all other existing usernames and emails to avoid collisions
  console.log("Fetching other existing usernames and emails from database to prevent duplicates...");
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

  const credentialsList = [];

  console.log("Generating unique usernames, custom 6-character passwords, and inserting students...");
  for (const s of excelStudents) {
    let baseUsername = s.username || "student";
    let username = baseUsername;
    let counter = 2;

    // Ensure username is unique
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

    // Generate custom 6-character password: 3 letters of username + 3 random digits
    const prefix = username.slice(0, 3).padEnd(3, "s");
    const randomDigits = Math.floor(100 + Math.random() * 900).toString(); // 3 random digits
    const password = prefix + randomDigits;

    // Hash the unique password
    const passwordHash = hashPassword(password);

    // Insert user
    const [insertedUser] = await db
      .insert(schema.users)
      .values({
        username,
        email,
        passwordHash,
        role: "student" as const,
        displayName: s.name,
        isActive: true,
        isSuspended: false,
        loginAttempts: 0,
        schoolName: targetClass.schoolName,
        province: targetClass.province,
        classId: targetClass.id,
      })
      .returning({ id: schema.users.id });

    // Auto-enroll student into the class
    await db.insert(schema.classEnrollments).values({
      classId: targetClass.id,
      studentId: insertedUser.id,
      enrolledBy: targetClass.teacherId,
      enrolledAt: new Date(),
    });

    credentialsList.push({
      no: s.no,
      name: s.name,
      gender: s.gender,
      username: username,
      password: password,
    });
  }

  console.log(`Successfully imported and enrolled ${credentialsList.length} students in class ${CLASS_CODE}.`);

  // Write credentials text file for reference
  let txtContent = `បញ្ជីឈ្មោះ និងគណនីសិស្សថ្នាក់ទី ៥ (Grade 5 Student Accounts - Class ${CLASS_CODE})\n`;
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
