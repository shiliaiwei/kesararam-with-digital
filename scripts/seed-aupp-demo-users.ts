import { config } from "dotenv";
config({ path: ".env.local" });

import { db } from "../src/lib/db";
import { users, classes, classEnrollments } from "../src/db/schema/users";
import { hashPassword } from "../src/lib/password";
import { eq, or } from "drizzle-orm";
import * as fs from "fs";
import * as path from "path";

const targetUsers = [
  { id_num: 1, username: "auppuser1", password: "AUPPUserX1", email: "auppuser1@demo.tech" },
  { id_num: 2, username: "auppuser2", password: "AUPPUserX2", email: "auppuser2@demo.tech" },
  { id_num: 3, username: "auppuser3", password: "AUPPUserX3", email: "auppuser3@demo.tech" },
  { id_num: 4, username: "auppuser4", password: "AUPPUserX4", email: "auppuser4@demo.tech" },
  { id_num: 5, username: "auppuser5", password: "AUPPUserX5", email: "auppuser5@demo.tech" },
  { id_num: 6, username: "auppuser6", password: "AUPPUserX6", email: "auppuser6@demo.tech" },
  { id_num: 7, username: "auppuser7", password: "AUPPUserX7", email: "auppuser7@demo.tech" },
  { id_num: 8, username: "auppuser8", password: "AUPPUserX8", email: "auppuser8@demo.tech" },
  { id_num: 9, username: "auppuser9", password: "AUPPUserX9", email: "auppuser9@demo.tech" },
  { id_num: 10, username: "auppuser10", password: "AUPPUserX10", email: "auppuser10@demo.tech" },
  { id_num: 11, username: "auppuser11", password: "AUPPUserX11", email: "auppuser11@demo.tech" },
  { id_num: 12, username: "auppuser12", password: "AUPPUserX12", email: "auppuser12@demo.tech" },
  { id_num: 13, username: "auppuser13", password: "AUPPUserX13", email: "auppuser13@demo.tech" },
  { id_num: 14, username: "auppuser14", password: "AUPPUserX14", email: "auppuser14@demo.tech" },
  { id_num: 15, username: "auppuser15", password: "AUPPUserX15", email: "auppuser15@demo.tech" },
  { id_num: 16, username: "auppuser16", password: "AUPPUserX16", email: "auppuser16@demo.tech" },
  { id_num: 17, username: "auppuser17", password: "AUPPUserX17", email: "auppuser17@demo.tech" },
];

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
