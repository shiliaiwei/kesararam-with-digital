import { config } from "dotenv";
config({ path: ".env.local" });

import { db } from "./src/lib/db";
import { inviteCodes, users } from "./src/db/schema";
import { desc } from "drizzle-orm";

async function check() {
  try {
    const codes = await db.select().from(inviteCodes).limit(10);
    console.log("INVITE CODES:", codes);
    
    const latestUsers = await db.select().from(users).orderBy(desc(users.id)).limit(5);
    console.log("LATEST USERS:", latestUsers);
  } catch (err) {
    console.error("DB QUERY ERROR:", err);
  }
}

check();
