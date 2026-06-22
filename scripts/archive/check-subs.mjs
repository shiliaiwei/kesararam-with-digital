import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

import { db } from "../src/lib/db.ts";
import { subscriptions } from "../src/db/schema/subscriptions.ts";
import { users } from "../src/db/schema/users.ts";

async function run() {
  try {
    const allSubs = await db.select().from(subscriptions);
    console.log("SUBSCRIPTIONS:");
    console.log(JSON.stringify(allSubs, null, 2));

    const allTeachers = await db.select().from(users);
    console.log("USERS:");
    console.log(JSON.stringify(allTeachers.map(u => ({ id: u.id, username: u.username, displayName: u.displayName, role: u.role })), null, 2));
  } catch (err) {
    console.error(err);
  }
  process.exit(0);
}

run();
