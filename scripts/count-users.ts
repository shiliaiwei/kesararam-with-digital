import { config } from "dotenv";
config({ path: ".env.local" });

import { db } from "../src/lib/db";
import { users } from "../src/db/schema/users";
import { eq, like, and } from "drizzle-orm";

async function main() {
  const totalUsers = await db.select({ id: users.id }).from(users);
  
  const activeUsers = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.isActive, true));

  const activeStudents = await db
    .select({ id: users.id })
    .from(users)
    .where(and(eq(users.isActive, true), eq(users.role, "student")));

  const proptestUsers = await db
    .select({ id: users.id })
    .from(users)
    .where(like(users.username, "proptest_%"));

  console.log(`TOTAL_USERS: ${totalUsers.length}`);
  console.log(`ACTIVE_USERS: ${activeUsers.length}`);
  console.log(`ACTIVE_STUDENTS: ${activeStudents.length}`);
  console.log(`PROPTEST_USERS: ${proptestUsers.length}`);
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
