import { config } from "dotenv";
config({ path: ".env.local" });

import { db } from "../src/lib/db";
import { users } from "../src/db/schema/users";

async function main() {
  const result = await db.select({ username: users.username, displayName: users.displayName }).from(users);
  
  console.log("All display names in the database:");
  for (const user of result) {
    if (user.displayName) {
      const isKhmer = /[\u1780-\u17ff]/.test(user.displayName);
      console.log(`- Username: ${user.username} | Display Name: ${user.displayName} | Khmer: ${isKhmer}`);
    }
  }
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
