import "dotenv/config";
import { createHash } from "crypto";
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { sql as drizzleSql } from "drizzle-orm";
import * as schema from "../src/db/schema";

const sql = neon(process.env.DATABASE_URL!);
const db = drizzle(sql, { schema });

function hashPassword(pw: string): string {
  return createHash("sha256").update(pw).digest("hex");
}

async function main() {
  console.log("Truncating all tables...");

  // Truncate users table (cascade handles all FK references)
  await db.execute(drizzleSql`TRUNCATE TABLE users RESTART IDENTITY CASCADE`);

  console.log("All tables cleared.");

  const passwordHash = hashPassword("MdT(nkAjzvyy]Q#[moTrbh2");

  await db.insert(schema.users).values({
    username: "vi",
    email: "srievi@kwd.tech",
    passwordHash,
    role: "admin",
    displayName: "Vministration",
    isActive: true,
    isSuspended: false,
    loginAttempts: 0,
  });

  console.log("Admin created: vi / srievi@kwd.tech");
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
