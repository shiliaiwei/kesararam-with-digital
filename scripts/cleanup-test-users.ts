import { config } from "dotenv";
config({ path: ".env.local" });

import { db } from "../src/lib/db";
import { users } from "../src/db/schema/users";
import { like } from "drizzle-orm";

async function main() {
  console.log("Searching for test users starting with 'proptest_'...");
  const result = await db
    .select({ id: users.id, username: users.username })
    .from(users)
    .where(like(users.username, "proptest_%"));

  console.log(`Found ${result.length} test users:`, result.map(u => u.username));

  if (result.length > 0) {
    console.log("Deleting test users...");
    await db.delete(users).where(like(users.username, "proptest_%"));
    console.log("Cleanup finished successfully.");
  } else {
    console.log("No test users to clean up.");
  }
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("Cleanup failed:", err);
    process.exit(1);
  });
