import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { readFileSync } from "fs";
import {
  pgTable,
  serial,
  text,
  integer,
  boolean,
  timestamp,
  pgEnum,
} from "drizzle-orm/pg-core";
import { eq, or } from "drizzle-orm";

const env = readFileSync(".env.local", "utf8");
const url = env
  .match(/^DATABASE_URL=(.+)$/m)[1]
  .trim()
  .replace(/^['"]|['"]$/g, "");

// Simulate the exact schema in src/db/schema/users.ts
const roleEnum = pgEnum("role", ["student", "teacher", "admin"]);
const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull(),
  email: text("email").notNull(),
  passwordHash: text("password_hash").notNull(),
  role: roleEnum("role").notNull().default("student"),
  displayName: text("display_name"),
  avatar: text("avatar"),
  isActive: boolean("is_active").default(true).notNull(),
  isSuspended: boolean("is_suspended").default(false).notNull(),
  loginAttempts: integer("login_attempts").default(0).notNull(),
  lockedUntil: timestamp("locked_until"),
  lastLoginAt: timestamp("last_login_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  createdBy: integer("created_by"),
  avatarChangedAt: timestamp("avatar_changed_at"),
});

const db = drizzle(neon(url), { schema: { users } });

// Test the login SELECT
console.log("Testing Drizzle SELECT for login...");
const stmt = db
  .select()
  .from(users)
  .where(or(eq(users.email, "srievi@kwd.tech"), eq(users.username, "vi")));
console.log("SQL:", stmt.toSQL());

try {
  const [found] = await stmt;
  console.log("Drizzle SELECT OK:", found?.username, found?.role);
} catch (e) {
  console.error("Drizzle SELECT FAILED:", e.cause?.message ?? e.message);
  console.error("Full error:", JSON.stringify(e, null, 2));
}
