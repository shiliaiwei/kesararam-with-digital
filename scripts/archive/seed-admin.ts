import "dotenv/config";
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { sql as drizzleSql } from "drizzle-orm";
import * as schema from "../src/db/schema";
import { hashPassword } from "../src/lib/password";

const sql = neon(process.env.DATABASE_URL!);
const db = drizzle(sql, { schema });

/**
 * ARCHIVE SCRIPT — seed initial admin user.
 * Password is read from SEED_ADMIN_PASSWORD env var, NOT hardcoded.
 * Set it in your local .env before running: SEED_ADMIN_PASSWORD=yourpassword
 */
async function main() {
  const pw = process.env.SEED_ADMIN_PASSWORD;
  if (!pw) {
    console.error("ERROR: SEED_ADMIN_PASSWORD env var is required.");
    process.exit(1);
  }

  console.log("Truncating all tables...");

  // Truncate users table (cascade handles all FK references)
  await db.execute(drizzleSql`TRUNCATE TABLE users RESTART IDENTITY CASCADE`);

  console.log("All tables cleared.");

  const passwordHash = hashPassword(pw);

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

  console.log("Admin user created successfully.");
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
