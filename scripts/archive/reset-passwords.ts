import "dotenv/config";
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "../src/db/schema/users";
import { hashPassword } from "../src/lib/password";
import { eq } from "drizzle-orm";

const sql = neon(process.env.DATABASE_URL!);
const db = drizzle(sql, { schema });

/**
 * ARCHIVE SCRIPT — reset specific user passwords.
 *
 * Passwords are read from env vars, NOT hardcoded.
 * Set before running (in your local .env or shell):
 *   RESET_PW_ADMIN=...   RESET_PW_STAFF=...
 *   RESET_PW_TEACHER=... RESET_PW_STUDENT=...
 */
async function main() {
  const userResets = [
    { username: "shiliaiwei", password: process.env.RESET_PW_ADMIN },
    { username: "srievi",      password: process.env.RESET_PW_STAFF },
    { username: "teacher1",    password: process.env.RESET_PW_TEACHER },
    { username: "user1",       password: process.env.RESET_PW_STUDENT },
  ];

  // Fail fast if any required password is missing
  for (const reset of userResets) {
    if (!reset.password) {
      console.error(`ERROR: env var for "${reset.username}" is not set. Aborting.`);
      process.exit(1);
    }
  }

  console.log("Resetting user passwords and unlocking accounts...");

  for (const reset of userResets) {
    const passwordHash = hashPassword(reset.password!);

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
      console.log(`Updated: ${reset.username}`);
    } else {
      await db.insert(schema.users).values({
        username: reset.username,
        email: `${reset.username}@kwd.tech`,
        passwordHash,
        role:
          reset.username === "shiliaiwei" ? "admin"
          : reset.username === "teacher1" ? "teacher"
          : reset.username === "srievi" ? "staff"
          : "student",
        displayName:
          reset.username.charAt(0).toUpperCase() + reset.username.slice(1),
        isActive: true,
        isSuspended: false,
        loginAttempts: 0,
      });
      console.log(`Created: ${reset.username}`);
    }
  }

  // Unlock any other locked users
  await db.update(schema.users).set({
    loginAttempts: 0,
    lockedUntil: null,
    isActive: true,
  });
  console.log("All other users unlocked and set active.");
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
