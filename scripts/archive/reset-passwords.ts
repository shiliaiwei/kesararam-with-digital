import "dotenv/config";
import { createHash } from "crypto";
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "../src/db/schema/users";
import { eq } from "drizzle-orm";

const sql = neon(process.env.DATABASE_URL!);
const db = drizzle(sql, { schema });

function hashPassword(pw: string): string {
  return createHash("sha256").update(pw).digest("hex");
}

async function main() {
  console.log("Resetting user passwords and unlocking accounts...");

  const userResets = [
    { username: "shiliaiwei", password: "Admin@2026" },
    { username: "srievi", password: "Staff@2026" },
    { username: "teacher1", password: "Teacher@2026" },
    { username: "user1", password: "Student@2026" },
  ];

  for (const reset of userResets) {
    const passwordHash = hashPassword(reset.password);
    
    // Check if user exists
    const [existing] = await db
      .select()
      .from(schema.users)
      .where(eq(schema.users.username, reset.username));

    if (existing) {
      await db
        .update(schema.users)
        .set({
          passwordHash,
          isActive: true,
          isSuspended: false,
          loginAttempts: 0,
          lockedUntil: null,
        })
        .where(eq(schema.users.username, reset.username));
      console.log(`Updated existing user: ${reset.username} with password: ${reset.password}`);
    } else {
      // Create user if not exists
      await db.insert(schema.users).values({
        username: reset.username,
        email: `${reset.username}@kwd.tech`,
        passwordHash,
        role: reset.username === "shiliaiwei" ? "admin" : reset.username === "teacher1" ? "teacher" : reset.username === "srievi" ? "staff" : "student",
        displayName: reset.username.charAt(0).toUpperCase() + reset.username.slice(1),
        isActive: true,
        isSuspended: false,
        loginAttempts: 0,
      });
      console.log(`Created user: ${reset.username} with password: ${reset.password}`);
    }
  }

  // Also unlock any other locked users
  await db
    .update(schema.users)
    .set({
      loginAttempts: 0,
      lockedUntil: null,
      isActive: true,
    });
  console.log("Unlocked all other users and set them active.");
}

main()
  .then(() => {
    console.log("Password reset completed successfully!");
    process.exit(0);
  })
  .catch((err) => {
    console.error("Error resetting passwords:", err);
    process.exit(1);
  });
