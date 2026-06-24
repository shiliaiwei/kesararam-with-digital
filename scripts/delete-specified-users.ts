import { config } from "dotenv";
config({ path: ".env.local" });

import { db } from "../src/lib/db";
import { users } from "../src/db/schema/users";
import { eq } from "drizzle-orm";

async function main() {
  const usernames = ["noensuvnnruhsa", "yinminhchu", "linmani"];
  console.log("Searching for users:", usernames);
  
  for (const username of usernames) {
    const result = await db.select().from(users).where(eq(users.username, username));
    if (result.length > 0) {
      console.log(`Found user: ${username} (ID: ${result[0].id}, Email: ${result[0].email})`);
      await db.delete(users).where(eq(users.username, username));
      console.log(`Deleted user: ${username}`);
    } else {
      console.log(`User not found: ${username}`);
    }
  }
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
