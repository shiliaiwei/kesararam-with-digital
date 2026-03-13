import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { readFileSync } from "fs";

const env = readFileSync(".env.local", "utf8");
const url = env
  .match(/^DATABASE_URL=(.+)$/m)[1]
  .trim()
  .replace(/^['"]|['"]$/g, "");

const { pgTable, serial, text, integer, boolean, timestamp, pgEnum } =
  await import("drizzle-orm/pg-core");

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

// Show the SQL Drizzle generates without running it
const stmt = db.insert(users).values({
  username: "__drizzle_diag__",
  email: "__drizzle_diag@kwd.tech",
  passwordHash: "hash",
  role: "student",
  isActive: true,
  loginAttempts: 0,
});
console.log("SQL:", stmt.toSQL());

try {
  const r = await stmt.returning({ id: users.id });
  console.log("Drizzle INSERT OK:", r[0]);
  await db.delete(users).where(sql`username = '__drizzle_diag__'`);
  console.log("cleaned up");
} catch (e) {
  console.error("Drizzle INSERT FAILED:", e.message);
}
