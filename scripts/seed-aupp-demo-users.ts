import { config } from "dotenv";
config({ path: ".env.local" });

import { db } from "../src/lib/db";
import { users, classes, classEnrollments } from "../src/db/schema/users";
import { hashPassword } from "../src/lib/password";
import { eq, or } from "drizzle-orm";
import * as fs from "fs";
import * as path from "path";

// AUPP demo user accounts — passwords are set via AUPP_DEMO_PASSWORD env var,
// NOT hardcoded. Set before running: AUPP_DEMO_PASSWORD=yourpassword
const DEMO_PASSWORD = process.env.AUPP_DEMO_PASSWORD;
if (!DEMO_PASSWORD) {
  console.error("ERROR: AUPP_DEMO_PASSWORD env var is required. Aborting.");
  process.exit(1);
}

const targetUsers = Array.from({ length: 17 }, (_, i) => ({
  id_num: i + 1,
  username: `auppuser${i + 1}`,
  password: DEMO_PASSWORD,
  email: `auppuser${i + 1}@demo.tech`,
}));


async function main() {
  const [cls] = await db.select().from(classes).where(eq(classes.code, "ZIHNM7"));
  if (!cls) {
    throw new Error("Class ZIHNM7 not found!");
  }
  const classId = cls.id;
  const teacherId = cls.teacherId;

  console.log(`Using Class ID: ${classId} (${cls.name})`);

  const createdOrUpdatedList = [];

  for (const item of targetUsers) {
    const hashed = hashPassword(item.password);
    const oldUsername = `auppuser-${item.id_num}`;
    const oldEmail = `auppuser-${item.id_num}@demo.tech`;
    const numDisplayName = `AUPP Student ${item.id_num}`;

    // Find all users matching new or old username, email, or display name
    const matches = await db
      .select()
      .from(users)
      .where(
        or(
          eq(users.username, item.username),
          eq(users.username, oldUsername),
          eq(users.email, item.email),
          eq(users.email, oldEmail),
          eq(users.displayName, numDisplayName)
        )
      );

    let primaryUser = matches[0];

    // Delete any extra duplicate rows for this user number to prevent unique constraint errors
    if (matches.length > 1) {
      for (let i = 1; i < matches.length; i++) {
        const dupId = matches[i].id;
        console.log(`Cleaning duplicate user ID ${dupId} for ${item.username}`);
        await db.delete(classEnrollments).where(eq(classEnrollments.studentId, dupId));
        await db.delete(users).where(eq(users.id, dupId));
      }
    }

    let userId: number;

    if (primaryUser) {
      userId = primaryUser.id;
      await db
        .update(users)
        .set({
          username: item.username,
          email: item.email,
          passwordHash: hashed,
          displayName: numDisplayName,
          schoolName: "American University of Phnom Penh",
          province: "Phnom Penh",
          classId: classId,
          isActive: true,
          isSuspended: false,
          loginAttempts: 0,
          lockedUntil: null,
          updatedAt: new Date(),
        })
        .where(eq(users.id, userId));
      console.log(`Updated user ${item.username} (ID: ${userId})`);
    } else {
      const [inserted] = await db
        .insert(users)
        .values({
          username: item.username,
          email: item.email,
          passwordHash: hashed,
          role: "student",
          displayName: numDisplayName,
          schoolName: "American University of Phnom Penh",
          province: "Phnom Penh",
          classId: classId,
          isActive: true,
          isSuspended: false,
          loginAttempts: 0,
        })
        .returning({ id: users.id });
      userId = inserted.id;
      console.log(`Inserted user ${item.username} (ID: ${userId})`);
    }

    const enrollment = await db
      .select()
      .from(classEnrollments)
      .where(eq(classEnrollments.studentId, userId));

    if (enrollment.length === 0) {
      await db.insert(classEnrollments).values({
        classId: classId,
        studentId: userId,
        enrolledBy: teacherId,
      });
      console.log(`Enrolled user ID ${userId} into class ${classId}`);
    }

    createdOrUpdatedList.push({
      num: item.id_num,
      username: item.username,
      password: item.password,
      email: item.email,
      role: "Student",
      status: "Active",
    });
  }

  let txtContent = `================================================================================
AUPP STUDENT PROJECT SHOWCASE
Class Access & Onboarding Guide (Class Code: ZIHNM7)
================================================================================

Student Credentials List (${createdOrUpdatedList.length} Demo Accounts)

`;

  txtContent += `#  | Username       | Password       | Email                      | Role    | Status\n`;
  txtContent += `---|----------------|----------------|----------------------------|---------|--------\n`;

  for (const u of createdOrUpdatedList) {
    const numStr = String(u.num).padStart(2, " ");
    const uName = u.username.padEnd(14, " ");
    const uPass = u.password.padEnd(14, " ");
    const uEmail = u.email.padEnd(26, " ");
    txtContent += `${numStr} | ${uName} | ${uPass} | ${uEmail} | ${u.role.padEnd(7, " ")} | ${u.status}\n`;
  }

  txtContent += `\n================================================================================\n`;
  txtContent += `Step-by-Step Account Sign-In Guide:\n`;
  txtContent += `1. Go to Login page on Kesararam With Digital\n`;
  txtContent += `2. Enter Username or Email and Password from above\n`;
  txtContent += `3. Join Class with Code: ZIHNM7 if prompted\n`;
  txtContent += `================================================================================\n`;

  const outPath = path.join(process.cwd(), "aupp_student_credentials.txt");
  fs.writeFileSync(outPath, txtContent, "utf-8");
  console.log(`Saved credentials file to ${outPath}`);
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
