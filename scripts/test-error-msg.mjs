import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { readFileSync } from "fs";
import {
  pgTable,
  serial,
  text,
  integer,
  boolean,
  pgEnum,
} from "drizzle-orm/pg-core";

const env = readFileSync(".env.local", "utf8");
const url = env
  .match(/^DATABASE_URL=(.+)$/m)[1]
  .trim()
  .replace(/^['"]|['"]$/g, "");

const roleEnum = pgEnum("role", ["student", "teacher", "admin"]);
const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  role: roleEnum("role").notNull().default("student"),
  displayName: text("display_name"),
  isActive: boolean("is_active").default(true).notNull(),
  loginAttempts: integer("login_attempts").default(0).notNull(),
});

const sql = neon(url);
const db = drizzle(sql, { schema: { users } });

// First clean up any leftovers from previous test
await sql`DELETE FROM users WHERE username LIKE '__diag%'`;
console.log("Cleaned up previous test rows");

// Test 1: Insert the same row twice to get unique constraint error
await db
  .insert(users)
  .values({
    username: "__diag_u",
    email: "__diag@kwd.tech",
    passwordHash: "h",
    role: "student",
    isActive: true,
    loginAttempts: 0,
  });
console.log("First insert OK");
try {
  await db
    .insert(users)
    .values({
      username: "__diag_u",
      email: "__diag@kwd.tech",
      passwordHash: "h",
      role: "student",
      isActive: true,
      loginAttempts: 0,
    });
} catch (e) {
  console.log("Duplicate error message:", JSON.stringify(e.message));
  console.log("Includes 'unique'?", e.message.includes("unique"));
  console.log("Error code:", e.code);
}

// Cleanup
await sql`DELETE FROM users WHERE username = '__diag_u'`;
console.log("Done");

// Test 2: Simulate the createUser bug with null displayName
try {
  const nullVal = null;
  const trimmed = nullVal.trim(); // This would be the bug
  console.log("trim on null succeeded:", trimmed); // won't reach
} catch (e) {
  console.log("NULL TRIM ERROR:", e.message); // "Cannot read properties of null"
}
