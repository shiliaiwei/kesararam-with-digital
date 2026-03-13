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
import { eq } from "drizzle-orm";

const env = readFileSync(".env.local", "utf8");
const url = env
  .match(/^DATABASE_URL=(.+)$/m)[1]
  .trim()
  .replace(/^['"]|['"]$/g, "");

const roleEnum = pgEnum("role", ["student", "teacher", "admin"]);
const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull(),
  displayName: text("display_name"),
  avatar: text("avatar"),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  avatarChangedAt: timestamp("avatar_changed_at"),
});

const db = drizzle(neon(url), { schema: { users } });

// Check admin user (id 1)
const [admin] = await db.select().from(users).where(eq(users.id, 1));
console.log("Admin user:", admin);

// Test UPDATE
try {
  await db
    .update(users)
    .set({
      displayName: admin.displayName || "Admin",
      avatar: JSON.stringify({ face: "Loving Grin 2.svg", head: "" }),
      updatedAt: new Date(),
      avatarChangedAt: new Date(),
    })
    .where(eq(users.id, 1));
  console.log("UPDATE OK");
} catch (e) {
  console.error("UPDATE FAILED:", e.message);
  console.error("Error keys:", Object.keys(e));
  console.error("Error cause:", e.cause?.message ?? e.cause);
  console.error("Error detail:", e.detail);
  console.error("Error code:", e.code);
  console.error("Full error:", JSON.stringify(e, null, 2));
}
